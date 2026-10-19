/** Dialogue: Act III Chapter 8 "The Hollow Sea" (docs/lore/14-act3-spec.md), part 1: the shore and the seven
 *  drowned memories. Owner: Claude 4. The Ysolde confrontation is in act3-ch8b.ts.
 *  - dialogue:obj-dream-memory-N hosts one companion’s worst dream, entered only while that companion follows.
 *    The decision sets act3.dream.<slug> = 'faced' | 'fled' on the choice itself.
 *  - Every object falls back to the player’s own dream (the night of the Ashmark, act3.dream.player), and once that
 *    is dreamed, to a short “echo”. Every object always opens something, so any three interactions finish the stage. */
import type { DialogueDef, DialogueNode, NarrativeCondition, NarrativeEffect, NpcId } from '@/core';

const Q = 'quest:into-the-dreaming' as const;
const MAREN = 'npc:maren-hollis' as const, ANSELM = 'npc:anselm-pryde' as const, SABLE = 'npc:sable' as const;
const CADOC = 'npc:cadoc-ap-ynys' as const, GRIMMA = 'npc:grimma-ironsong' as const, VESPER = 'npc:vesper-qadri' as const;
const HESTA = 'npc:hesta-corrow' as const;
const TOBIN = 'npc:tobin-hollis' as const, WENNA = 'npc:saint-wenna' as const, ULKA = 'npc:ulka-ironsong' as const;
const NHAL = 'npc:nhal' as const, GIRL = 'npc:young-ysolde' as const, NOVICE = 'npc:aurenac-novice' as const, UNMARKED = 'npc:the-unmarked' as const;

const f = (flag: string): NarrativeCondition => ({ flag });
const is = (flag: string, value: string): NarrativeCondition => ({ flag, op: '==', value });
const all = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: c });
const any = (...c: NarrativeCondition[]): NarrativeCondition => ({ any: c });
const not = (c: NarrativeCondition): NarrativeCondition => ({ not: c });
const slugOf = (npc: NpcId) => npc.slice(4);
const fol = (npc: NpcId) => f(`companion.${slugOf(npc)}.following`);
const love = (npc: NpcId, delta: number): NarrativeEffect => ({ loyalty: npc, delta });
const DREAM = (slug: string) => `act3.dream.${slug}`;
/** the decision: set on the choice, so closing the dream at any later node keeps it */
const decide = (npc: NpcId | 'player', value: 'faced' | 'fled', delta = 0): NarrativeEffect[] => {
  const slug = npc === 'player' ? 'player' : slugOf(npc);
  const out: NarrativeEffect[] = [{ setFlag: DREAM(slug), value }];
  if (npc !== 'player' && delta) out.push(love(npc, delta));
  return out;
};
const inQuest = any({ questActive: Q }, { questCompleted: Q });

// ----- shared history
const tobinHome = any(f('act1.tobin_saved'), is('prologue.tobin_fate', 'saved'));
const tobinLost = f('act1.tobin_lost');
const tobinDead = all(is('prologue.tobin_fate', 'dead'), not(tobinHome), not(tobinLost));
const tobinAway = all(not(tobinHome), not(tobinDead));            // lost in the reeds, or never found
const hestaAlive = f('act1.hesta_alive');
const PATH = 'companion.anselm-pryde.path', VERSE = 'companion.cadoc-ap-ynys.verse', RING = 'companion.grimma-ironsong.ring';
const betrayed = f('prologue.anselm_betrayed');

/** The player’s own dream: the night of the Ashmark. Spread into every memory as the fallback. */
const SELF: Record<string, DialogueNode> = {
  's-start': {
    speaker: 'narrator',
    text: 'You put out your hand to the memory, and it is not anyone else’s. It knows you. The water round it goes still and white, and you are standing on Brindle Moor in the snow on Lanternmass night, a year and more ago: the night of the Ashmark. Your hand is whole. It is so cold you had forgotten that hands could be cold.',
    next: 's-sky',
  },
  's-sky': {
    speaker: 'narrator',
    text: 'You remember this. The fold-gate, the lantern you were carrying home, the bells of Brindlecross small in the valley below. Then the sky splits from end to end and the stars come down: seven of them, white, burning. Six go away over the hills. One comes straight for you, hissing, low enough to touch. And stops. It hangs in the air an arm’s length from your face, burning, and waits.',
    next: 's-other',
  },
  's-other': {
    speaker: 'narrator',
    text: 'A pace to your left, somebody is standing in the snow who was not there before. Your coat. Your face. Your hands in your pockets, both of them whole. They look at you the way one looks at a stranger who has taken one’s seat.',
    next: 's-hub',
  },
  's-hub': {
    speaker: UNMARKED,
    text: 'It’s only a pace. That’s all it ever was. You were standing there, and it came past, and it touched you. If you’d been standing here, where I am, it would have gone on into the mere with the others, and you’d have gone home and had your supper.',
    choices: [
      { text: '“Who are you?”', to: 's-who', once: true },
      { text: '“What happened to you? After.”', to: 's-after' },
    ],
  },
  's-who': { speaker: UNMARKED, text: 'You. The one it missed. (A shrug you know from the inside.) Nobody, then. That’s the whole point of me. Nobody ever asked me to carry anything, and I never did.', next: 's-hub' },
  's-after': {
    speaker: UNMARKED,
    text: 'I went home. I had my supper. Next Lanternmass the pyre was lit with tinder, the ordinary way, and it smoked, and everyone complained. And that night the Hollis boy walked out to the water.',
    choices: [
      { text: '[Listen]', to: 's-t-home', when: tobinHome },
      { text: '[Listen]', to: 's-t-dead', when: tobinDead },
      { text: '[Listen]', to: 's-t-away', when: tobinAway },
    ],
  },
  's-t-home': { speaker: UNMARKED, text: 'In yours, he’s home. Eating everyone’s bread. Because your hand burned it out of him. (It smiles.) In mine nobody burned him and nobody saved him. He just went, and Maren went after him, and that was that. But it wasn’t my fault, was it? Nothing has ever been my fault.', next: 's-hesta' },
  's-t-dead': { speaker: UNMARKED, text: 'In yours, he burned. Under your hand, in the crypt, with his sister watching. (It says it gently.) In mine he only walked into the mere and didn’t come back. Nobody’s hand. Nobody’s fault. Doesn’t that sound restful?', next: 's-hesta' },
  's-t-away': { speaker: UNMARKED, text: 'In yours he’s out in the reeds still, or under them, and you were there, and you couldn’t bring him home. In mine he’s exactly as lost, and I never had to watch Maren’s face while I failed. Same boy. Same water. Only one of us has to carry it.', next: 's-hesta' },
  's-hesta': {
    speaker: UNMARKED,
    text: 'That spring an old woman came through Brindlecross with a sword that steamed in the snow, looking for a mark. She didn’t find one. She went on east.',
    choices: [
      { text: '[Listen]', to: 's-h-alive', when: hestaAlive },
      { text: '[Listen]', to: 's-h-dead', when: not(hestaAlive) },
    ],
  },
  's-h-alive': { speaker: UNMARKED, text: 'She died at Varn, in mine. On her own, in the black water, with nobody to stand in a pool and hold her hand. In yours she’s alive, and coughing, and cross with you. You saved her. (It tilts its head.) And you think that makes it worth it. Wait until you see what it costs her at the end.', next: 's-sleep' },
  's-h-dead': { speaker: UNMARKED, text: 'She died at Varn, in mine. On her own. In yours she died at Varn too, burning herself to coals to pull you out of the water. (It shrugs.) So what did you change, exactly? Only who had to watch.', next: 's-sleep' },
  's-sleep': {
    speaker: UNMARKED, mood: 'hollow',
    text: 'And the second winter the water came up through the floors. Ever so gently. (Black runs from its eyes, and it smiles.) Everyone’s asleep now. Maren. Godric. Old Wat with his hearth. Me. Step over here. It’s only a pace. Let it go past. Let it be somebody else’s, or nobody’s, and nothing will ever be your fault again.',
    next: 's-choice',
  },
  's-choice': {
    speaker: 'narrator',
    text: 'The star hangs in the air, hissing. Your hand is so cold. The snow where the other you is standing is not snow at all, you see now; it is water, white with cold, and it is up to their knees.',
    choices: [
      { text: '[Hold out your hand]', to: 's-faced', effects: decide('player', 'faced') },
      { text: '[Hollow-touched] “I know your voice. You aren’t me. You never were.”', to: 's-hollow', when: { dialogueTag: 'hollow-touched' }, tag: 'trait', effects: decide('player', 'faced') },
      { text: '[Step aside]', to: 's-fled', effects: decide('player', 'fled') },
    ],
  },
  's-hollow': {
    speaker: 'narrator',
    text: 'The other you stops smiling. For a moment its face is no face at all, only water holding a shape because it has been told to, and under it the long patient swallowing you have heard in every dream since the Embers came. “We only wanted to help,” it says, in more than one voice. You reach past it and take the star.',
    next: 's-wake',
  },
  's-faced': {
    speaker: 'narrator',
    text: 'You hold out your hand. You know what is coming, this time; you have known for a year. The star goes into your palm like a nail into a board, and it hurts exactly as much as it did, and you do not let go. Through the white you hear the other one say, quite calmly, “Oh. You’d do it again.”',
    next: 's-wake',
  },
  's-wake': { speaker: 'narrator', text: 'Then the moor goes white, and goes. You are standing in the shallows of the Hollow Sea with your marked hand burning and the rain falling up past your face.' },
  's-fled': {
    speaker: 'narrator',
    text: 'You step aside. It is only a pace. The star goes by so close it singes your sleeve, and away over the moor into the dark, and the other you is gone, and the moor is very quiet. You stand a long while, whole-handed, waiting to feel relieved. Then you look down. The mark is there; of course it is; this was only a dream. But you know now which way you would have stepped, and so does the thing under the water. Somewhere far down, not unkindly, it laughs.',
  },
};

interface DreamSpec {
  n: number; npc: NpcId; label: string;
  /** shown outside the quest, and when the companion is absent and the player has dreamed their own dream */
  echo: string; faced: string; fled: string;
  /** start node(s) for the companion’s dream; each is gated on that companion following */
  starts: { when?: NarrativeCondition; node: string }[];
  nodes: Record<string, DialogueNode>;
}

function dream(s: DreamSpec): DialogueDef {
  const flag = DREAM(slugOf(s.npc));
  return {
    id: `dialogue:obj-dream-memory-${s.n}`, name: `Object: Drowned memory ${s.n} (${s.label})`,
    entries: [
      { when: not(inQuest), node: 'echo' },
      { when: is(flag, 'faced'), node: 'after-faced' },
      { when: is(flag, 'fled'), node: 'after-fled' },
      ...s.starts.map((e) => ({ when: e.when ? all(fol(s.npc), e.when) : fol(s.npc), node: e.node })),
      { when: f(DREAM('player')), node: 'echo' },
      { node: 's-start' },
    ],
    nodes: {
      echo: { speaker: 'narrator', text: `${s.echo} It is somebody’s memory, set hard as wax. They are not here to claim it, and it does not open for you.` },
      'after-faced': { speaker: 'narrator', text: s.faced },
      'after-fled': { speaker: 'narrator', text: s.fled },
      ...s.nodes,
      ...SELF,
    },
  };
}

const dialogues: DialogueDef[] = [
  // ================================================================ THE SHORE (opened on reaching it; no stage waits on it)
  {
    id: 'dialogue:ch8-shore', name: 'Chapter 8: The shore of the Hollow Sea',
    entries: [{ node: 'arrive' }],
    nodes: {
      arrive: {
        speaker: 'narrator',
        text: 'At the bottom of the Black Seep the marsh stops. Not with a shore, exactly: the reeds grow thinner, and paler, and then they are not reeds but the memory of reeds, and then there is the Hollow Sea. It goes on for ever, flat and black, under a sky that is also water. It is raining. The rain falls upward, out of the sea, in slow fat drops you can watch all the way up until they are lost.',
        next: 'things',
      },
      things: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:the-mirelands' }],
        text: 'The sea is full of things. Not wreckage: memories, set hard as wax and floating. A cottage with its door open. A lamp burning under the water. A pair of boots on a bank that should not be there. Some are very old. One of them is yours. The mark aches when you look at them, the way a bruise aches when it is pressed, and far off across the water, at the end of a road nobody laid, something white is standing with all its windows lit.',
        next: 'listen',
      },
      listen: {
        speaker: 'narrator', text: 'Nobody says anything for a while.',
        choices: [
          { text: '[Maren] She is staring at the cottage.', to: 'r-maren', when: fol(MAREN), once: true },
          { text: '[Anselm] He is praying under his breath.', to: 'r-anselm', when: fol(ANSELM), once: true },
          { text: '[Sable] She has gone very quiet.', to: 'r-sable', when: fol(SABLE), once: true },
          { text: '[Cadoc] He is watching the rain go up.', to: 'r-cadoc', when: fol(CADOC), once: true },
          { text: '[Grimma] She spits into the water.', to: 'r-grimma', when: fol(GRIMMA), once: true },
          { text: '[Vesper] She holds out her palm to the rain.', to: 'r-vesper', when: fol(VESPER), once: true },
          { text: '[Hesta] She is looking at the white thing far off.', to: 'r-hesta', when: fol(HESTA), once: true },
          { text: '(Walk on.)', to: 'walk' },
        ],
      },
      'r-maren': { speaker: MAREN, mood: 'afraid', next: 'listen', text: 'That’s my house. Out there, on the water. The door’s open. (She grips her bow.) Mam always left the door open when the bread was in. Don’t. Don’t say anything. I know.' },
      'r-anselm': { speaker: ANSELM, mood: 'sad', next: 'listen', text: 'Lux in tenebris… (He stops.) Forgive me. I find I am saying the office for the dead without having decided to. There are so many of them out there. Every one of those things on the water was somebody’s worst night.' },
      'r-sable': { speaker: SABLE, mood: 'hollow', next: 'listen', text: '(She is watching the rain go up.) It’s quiet here. Isn’t it quiet? (She shakes herself, hard, like a dog coming out of a pond.) No. Don’t listen to me. Talk to me, love, all the way across, about anything. Knives.' },
      'r-cadoc': { speaker: CADOC, next: 'listen', text: 'My people have a word for rain that falls upward. It is the word for grief. I had always assumed it was a figure of speech. (A drop rises past his face.) It appears my ancestors were simply very literal.' },
      'r-grimma': { speaker: GRIMMA, mood: 'angry', next: 'listen', text: '(Her spittle floats.) Hah. Nothing holds here. Not water, not spit, not shape. Keep your boots on the hard bits, human, and if you can’t find any hard bits, stand on me.' },
      'r-vesper': { speaker: VESPER, next: 'listen', text: '(The rain runs up her wrist and leaves it dry.) Every fire I ever lit wanted to go up. I always thought that was its nature. Perhaps it was only trying to get home. (She closes her hand.) Don’t let me be poetic. It is a bad sign in a heretic.' },
      'r-hesta': { speaker: HESTA, mood: 'sad', next: 'listen', text: '(She does not cough.) That’s her. My girl, in there. I lit a candle in the window for her every night for eleven years, and I was always so cross when she came in late. (She sets her jaw.) Come on. I’ve kept her waiting long enough.' },
      walk: { speaker: 'narrator', text: 'You step off the last of the reeds onto the Hollow Sea, and it holds you, the way a held breath holds. The memories turn slowly on the water as you pass, like flowers turning to the sun; like faces turning to a fire. They have noticed the warmth in your hand.' },
    },
  },

  // ================================================================ 1. MAREN AND TOBIN
  dream({
    n: 1, npc: MAREN, label: 'Maren and Tobin',
    echo: 'An arrow stands upright in the black water, heron-fletched, the shaft dark with handling, humming faintly like a plucked string.',
    faced: 'The cottage has gone. Where it stood the water is only water, and on it floats a single heron feather, turning slowly, going nowhere.',
    fled: 'The cottage still stands on the water, black walls and upward rain, the door shut. Through the shutters you can see a candle by a bed, and somebody sitting up beside it.',
    starts: [{ node: 'm-start' }],
    nodes: {
      'm-start': {
        speaker: 'narrator',
        text: 'The memory is a cottage: Hollis cottage, at the top of Brindlecross by the ford, built of black water standing upright and holding its shape because somebody remembers it so hard. Rain rises off the thatch into the dark. The door is open. Inside the table is laid for three, and Maren is already sitting at it with her bow across her knees, as if she has been sitting there a long while.',
        next: 'm-1',
      },
      'm-1': { speaker: MAREN, mood: 'afraid', next: 'm-bed', text: '(She does not turn round.) Don’t come in loud. He’s asleep. (Very low.) I know it’s not real. I’ve known since I sat down. It doesn’t matter. It’s my house, and he’s asleep, and I’m not leaving him on his own.' },
      'm-bed': {
        speaker: 'narrator',
        text: 'By the hearth is Tobin’s bed, the box-bed he slept in until the night he was taken, with its patched curtain drawn. Under the curtain, across the floor, something dark is spreading.',
        choices: [
          { text: '[Draw back the curtain]', to: 'm-home', when: tobinHome },
          { text: '[Draw back the curtain]', to: 'm-dead', when: tobinDead },
          { text: '[Draw back the curtain]', to: 'm-lost', when: tobinAway },
        ],
      },
      'm-home': { speaker: 'narrator', next: 'm-home2', text: 'Tobin is in the bed, fourteen and gangling and fast asleep, the way he is asleep tonight in the real cottage, between writing her letters with all the spelling wrong. And black water is coming up through the blanket. Slowly. The way it came on Lanternmass night, before anyone woke.' },
      'm-home2': { speaker: MAREN, mood: 'sad', next: 'm-tobin', text: 'Every night since the abbey I dream it. He’s home. He’s safe. You burned it out of him and he screamed and he’s fine. And I still sit up and watch the bed, because I didn’t, that night. I was down on the green with a jug of Wat’s cider, laughing, and I never heard him go.' },
      'm-dead': { speaker: 'narrator', next: 'm-dead2', text: 'The bed is empty. The blanket is scorched through in the shape of a boy, and it is still smoking, and the smoke goes up to join the rain. On the pillow there is a little black water, where his head was.' },
      'm-dead2': { speaker: MAREN, mood: 'sad', next: 'm-tobin', text: 'I see the crypt every night. The reeds round his arms, and your hand, and then it being over. (She swallows.) That’s not the bad part. I can stand that part. The bad part is before. I was down on the green with a jug of Wat’s cider, laughing, and I never heard him go.' },
      'm-lost': { speaker: 'narrator', next: 'm-lost2', text: 'The bed is empty and soaked through, and the shutter above it is open. Outside, where the ford should be, there are reeds: Greywater reeds, grey with frost, going on for ever. Somebody out in them is calling her name. Not Maren. The baby name, the one only he ever used.' },
      'm-lost2': { speaker: MAREN, mood: 'sad', next: 'm-tobin', text: 'He calls every night, and every night I go out after him, and every night I stop at the knee. One of these nights I won’t stop. (Flatly.) That’s not the bad part, though. The bad part is the first night. I was down on the green with a jug of Wat’s cider, laughing, and I never heard him go.' },
      'm-tobin': { speaker: TOBIN, mood: 'hollow', next: 'm-mire', text: '(From the bed, or the reeds, or the smoke; it is hard to say where. It is his voice, cracking in the middle the way it did that winter.) Mam’s calling, Maren. She’s under the water and she’s coughing. Can’t you hear her? I waited and waited. Why didn’t you come?' },
      'm-mire': {
        speaker: 'narrator',
        text: 'Under the floor, very faintly, someone is coughing: the dry tearing cough of the Grey Lung, which took the Hollis children’s mother the winter before the saint came. Maren’s hands have gone white on the bow. The water from the bed has reached her boots. It is exactly as warm as she is, and it is saying, in no words at all: stay. Sit up with him. Sit up with him for ever, and this time you will not miss a thing.',
        choices: [
          { text: '“Say it, Maren. Whatever you came in here to say to him. Say it out loud.”', to: 'm-faced', effects: decide(MAREN, 'faced', 8) },
          { text: '[Ranger] “Your bowstring’s wet. You’d never let it get wet. This isn’t you.”', to: 'm-ranger', when: { classIs: 'class:ranger' }, tag: 'class', effects: decide(MAREN, 'faced', 10) },
          { text: '“He isn’t asking you. The water is. Come away, Maren. Now. Don’t look at the bed.”', to: 'm-fled', effects: decide(MAREN, 'fled', 2) },
        ],
      },
      'm-ranger': { speaker: MAREN, next: 'm-faced', text: '(She looks down at the string, and something like a laugh gets out of her.) Hearth and kin. It is wet. I’d skin anyone who let my string get wet. (She lifts her head.) All right. All right.' },
      'm-faced': { speaker: MAREN, mood: 'sad', next: 'm-faced2', text: '(She gets up and goes to the bed and kneels by it, the way she knelt by Mam’s bed every night that last winter, and puts her hand flat on the wet blanket.) I was asleep, Tob. I was on the green with a jug and I didn’t hear you go, and I’m sorry, and I’m sorry, and I can’t sit up for ever. I’m not going to. I’ve a bow to carry. (Her voice breaks, and she lets it.) I’m sorry I didn’t hear you.' },
      'm-faced2': { speaker: 'narrator', next: 'm-faced3', text: 'The coughing under the floor stops. Nothing answers her: no voice, no forgiveness, nothing the Mire could have offered her. The cottage only goes quiet, the way a house goes quiet after a long illness, and begins, very gently, to fall upward as rain. Maren stays on her knees until the last of it has gone. When she stands up her face is wet and quite calm.' },
      'm-faced3': { speaker: MAREN, text: 'Don’t say anything. (She wipes her face with the back of her bow-hand.) …Thanks. For standing there. You always did stand there like a post when I was crying; it used to make me furious. (A breath.) Come on. We’ve a saint to see.' },
      'm-fled': { speaker: 'narrator', next: 'm-fled2', text: 'You take her by the arm and she lets you, which frightens you more than if she had fought. You walk her to the door with her face turned from the bed. Behind you the coughing goes on, patient, and Tobin’s voice says her baby name once more, and then the door is shut and you are standing on the black water in the rising rain, with the cottage still lit behind you.' },
      'm-fled2': { speaker: MAREN, mood: 'sad', text: 'Thanks. (She does not look back.) I’ll go back in one night. I know I will. Just not with it watching. (She shoulders her bow and walks on, quite carefully, the way you walk with something full to the brim.)' },
    },
  }),

  // ================================================================ 2. ANSELM AND WENNA
  dream({
    n: 2, npc: ANSELM, label: 'Anselm and Wenna',
    echo: 'A lamp burns under the black water, a plain clay lamp of the kind the sisters of Saint Wenna carried, its flame quite steady though it is drowned. Nobody tends it.',
    faced: 'The drowned lamp has risen to the surface and floats there, still burning, small and warm and very ordinary.',
    fled: 'The lamp is still burning at the bottom of the water. If you listen, you can hear a man’s voice down there saying the office, very fast, and never reaching the end.',
    starts: [{ node: 'a-start' }],
    nodes: {
      'a-start': {
        speaker: 'narrator',
        text: 'The memory is a church: the nave of Saint Wenna’s Abbey as it was the night Anselm kept the vigil there, made of black water and lamplight, with the rain falling up from the flags into the roof. Anselm is kneeling at the altar with his back to you, saying the night office. He says it very fast. He has been saying it, you think, for a long time, and every time he reaches the end he begins again.',
        next: 'a-1',
      },
      'a-1': { speaker: ANSELM, mood: 'afraid', next: 'a-wenna', text: '(Without stopping.) …lux in tenebris, lux manet… Don’t interrupt me. Please. If I stop, she will come up the nave and ask me again, and this time I know what she will say.' },
      'a-wenna': { speaker: 'narrator', next: 'a-wenna2', text: 'Behind you the west door opens on water. A small woman comes up the nave with her sleeves rolled to the elbow and her skirts wet to the knee: Wenna, just Wenna, lit the way horn is lit with a candle behind it. Only the light is wrong. It is not warm and brown. It is white, the white of the Pale Saint, and the water does not shine on her. It runs.' },
      'a-wenna2': {
        speaker: WENNA, mood: 'hollow',
        text: 'There you are, love. Still saying my words back to me. (She sits on the step beside him, like a neighbour at a wake.) You listened, once. You told your friend. You stopped after the office and listened properly, and you felt something warm under everything, very tired. Shall I tell you what it was, Brother?',
        choices: [
          { text: '[Listen]', to: 'a-inq', when: is(PATH, 'inquisitor') },
          { text: '[Listen]', to: 'a-reform', when: is(PATH, 'reform') },
          { text: '[Listen]', to: 'a-heretic', when: is(PATH, 'heretic') },
          { text: '[Listen]', to: 'a-cell', when: all(not(f(PATH)), betrayed) },
          { text: '[Listen]', to: 'a-plain', when: all(not(f(PATH)), not(betrayed)) },
        ],
      },
      'a-inq': { speaker: WENNA, mood: 'hollow', next: 'a-us', text: 'You chose the Wick, in your heart. I heard you choose it at my altar. So: (and the nave is a cell in Valcastre, and Anselm stands on the other side of the bars in grey, with a loaf in his hands) you will bless the bread every morning, and you will never ask the prisoner’s name. You were so sure you would be different. Everyone in grey is sure.' },
      'a-reform': { speaker: WENNA, mood: 'hollow', next: 'a-us', text: 'You said the Church could be mended. And it will be: (and the nave is the Cathedral of the Brand, lit white, and Anselm stands at the altar in a Hierophant’s gold) every wall standing, every licence in its drawer, every child with a candle in her finger taken at dawn. Mended exactly as it was. Count the walls, Brother. They are all there.' },
      'a-heretic': { speaker: WENNA, mood: 'hollow', next: 'a-us', text: 'You said faith needs no church. Then here is your faith with no church round it: (and the roof is gone, and the altar, and the lamp, and Anselm kneels on black water in the dark with his hands together) nothing. No one. Only you, and the warm thing under everything, listening.' },
      'a-cell': { speaker: WENNA, mood: 'hollow', next: 'a-us', text: 'They put you in a cell for owning a book. (And the nave is the cell, and through the grille comes the voice that told the Wick about the books: the voice of the one standing behind you now.) You forgave that, or you did not. It hardly matters down here. Down here everyone is forgiven, because nobody is anyone.' },
      'a-plain': { speaker: WENNA, mood: 'hollow', next: 'a-us', text: 'You never had to choose, did you? Your books in the chapel wall, your doubts in your mouth, and the office every night in case. (And the nave is Brindlecross chapel, small and cold, the stove out.) In case of what, Brother? In case someone was there?' },
      'a-us': { speaker: NHAL, mood: 'hollow', next: 'a-choice', text: '(She leans close, and her voice is no longer one voice.) It was us. The warmth under everything. The tiredness. The thing you prayed to on the nights you stopped and listened. There is no Lantern at the top of the world, little priest. There is only us at the bottom of it, and we have been so glad of your company.' },
      'a-choice': {
        speaker: 'narrator',
        text: 'Anselm has stopped praying. He is looking at his hands. Beyond the thing that wears Wenna’s face, on its hook by the west door, a clay lamp is still burning: the real lamp, the one he lit, warm and brown, the one light in the place that does not run.',
        choices: [
          { text: '“Anselm. Look at the lamp. That light is real. She isn’t. Answer her yourself.”', to: 'a-faced', effects: decide(ANSELM, 'faced', 8) },
          { text: '[Devout] “Then pray with me. Not the office. Not to anything. Just pray.”', to: 'a-pray', when: { dialogueTag: 'devout' }, tag: 'trait', effects: decide(ANSELM, 'faced', 10) },
          { text: '“Keep praying, Brother. Don’t listen to it. Say the words.”', to: 'a-fled', effects: decide(ANSELM, 'fled', -2) },
        ],
      },
      'a-pray': { speaker: 'narrator', next: 'a-faced', text: 'You kneel beside him on the black water. Neither of you says anything aloud. The thing in Wenna’s shape waits for a word to take hold of, and none comes. After a while Anselm’s shoulders begin to shake, and you think he is weeping, and then you understand that he is laughing.' },
      'a-faced': { speaker: ANSELM, next: 'a-faced2', text: '(He gets up off his knees, an old man’s rising.) Perhaps it was you. Perhaps every time I listened, it was you listening back. (He looks past her, at the lamp.) But I lit that, with my own hands, in a drowned church, because a woman asked me what I believed. And I believe this: that a thing which has to wear a saint’s face to be loved is not a god. It is only lonely. (Gently.) I am sorry you are lonely. You may not have me.' },
      'a-faced2': { speaker: 'narrator', next: 'a-faced3', text: 'The white goes out of Wenna’s face like breath off a glass, and for a moment she is only a small plain woman with chilblains, smiling at him. Then she is not there at all. The nave falls upward into rain, every stone of it, and the last thing left is the lamp, which does not fall. It rises, still burning, and floats on the Hollow Sea like a lantern on a pond at Lanternmass.' },
      'a-faced3': { speaker: ANSELM, mood: 'happy', text: 'Well. (He wipes his spectacles on his sleeve, which is wet, and makes them worse.) I appear to have preached a sermon to the Drowned One. I shall not be putting that in my letters. (Softer.) Thank you. I should not have liked to find out what I believed alone.' },
      'a-fled': { speaker: 'narrator', next: 'a-fled2', text: 'He takes up the words again where he left them, faster, louder, the night office and then the morning office and then the office for the dead, and you say them with him where you know them. The thing in Wenna’s shape listens with its head on one side, patient as water. It is still listening when the nave goes thin and grey and lets you go.' },
      'a-fled2': { speaker: ANSELM, mood: 'sad', text: 'I could not answer her. (He folds his hands to hide that they are shaking.) Forty years of answers, and not one of them mine. Do not look at me like that. I shall think of one. I have always been slow; it is why they sent me to Brindlecross.' },
    },
  }),

  // ================================================================ 3. SABLE AND THE WATER
  dream({
    n: 3, npc: SABLE, label: 'Sable and the water',
    echo: 'On a bank of black water, where no bank should be, a pair of boots stands side by side, toes together, the way a tidy guest leaves them at the door.',
    faced: 'The boots are gone from the bank. Somebody has scratched a little sign into the water where they stood, which ought to be impossible: two fingers folded, thumb across.',
    fled: 'The boots are still on the bank, toes together. Every now and then the water creeps up and touches them, very gently, and draws back.',
    starts: [{ when: is('companion.sable.fate', 'saved'), node: 'sb-start' }, { node: 'sc-start' }],
    nodes: {
      // --- saved: warm hands, and the quiet she misses
      'sb-start': {
        speaker: 'narrator',
        text: 'The memory is the black pool at Tobin’s Reeds, where Sable went to the water and you burned the water out of her. It is all here, set hard as wax: the frozen reeds, the smoking pool, the boots on the bank. Sable is sitting beside them, barefoot, with her feet in the water to the ankle. Her hands lie in her lap, warm and red and horrible, and she is looking at them as if they belonged to someone else.',
        next: 'sb-1',
      },
      'sb-1': { speaker: SABLE, next: 'sb-2', text: 'Oh. Hello, love. Don’t make that face; I’m only paddling. (She waggles her toes in the black.) It’s the oddest thing. I came down to see if it still wanted me. And it doesn’t. It’s just cold water now. It won’t sing to me any more.' },
      'sb-2': { speaker: SABLE, mood: 'sad', next: 'sb-3', text: '(Brightly. Too brightly.) Which is good. That’s good. That’s what we wanted. That’s what it hurt for.' },
      'sb-3': { speaker: 'narrator', next: 'sb-4', text: 'Then, from somewhere under the reeds, very soft, someone begins to hum: a woman’s voice, like a mam on the other side of a wall. Sable goes perfectly still. You watch her shoulders come down from round her ears for the first time since Greywater. You watch her close her eyes.' },
      'sb-4': { speaker: SABLE, mood: 'hollow', next: 'sb-choice', text: 'There it is. (Barely a whisper.) Do you know I’ve not had one quiet minute since you burned it out of me? Everything’s so loud. My hands ache. I’m hungry all the time. And it was so quiet in there, love. Just her humming, and nobody wanting anything of me. (She opens her eyes.) That’s what I never told you. I miss it. Isn’t that a dreadful thing to miss?' },
      'sb-choice': {
        speaker: 'narrator', text: 'The water has come up to her shins. She has not moved her feet. The humming goes on: kind, and patient, and sorry.',
        choices: [
          { text: '“It isn’t dreadful. Tell me what you miss. All of it, out loud.”', to: 'sb-faced', effects: decide(SABLE, 'faced', 8) },
          { text: '“Your knives are cheap Haldren tin, and your hair looks like a gull’s nest.”', to: 'sb-angry', when: f('companion.sable.beat_70'), effects: decide(SABLE, 'faced', 10) },
          { text: '“Put your boots on, Sable. We’re going. Now.”', to: 'sb-fled', effects: decide(SABLE, 'fled', 2) },
        ],
      },
      'sb-angry': { speaker: SABLE, mood: 'angry', next: 'sb-faced', text: '(Her head comes round like a cat’s.) I beg your pardon? Tin? These are Brackhaven steel, these are; I took them off a harbour-master. And my hair is— (She stops, and stares at you, and begins to laugh, furious and helpless, with her feet in the water.) Oh, you rotten thing. You remembered. You actually remembered.' },
      'sb-faced': { speaker: 'narrator', next: 'sb-faced2', text: 'She talks. She talks for a long time with her feet in the black, and you let her: about the quiet, and the humming, and how her hands never ached in there, and how nobody in the water ever once asked her to be clever. Somewhere in the middle of it she takes her feet out, one and then the other, and sets them on the frozen bank, and does not seem to notice she has done it.' },
      'sb-faced2': { speaker: SABLE, mood: 'sad', next: 'sb-faced3', text: 'There. That’s the lot. (She sniffs.) I’ll still miss it. I think I’ll miss it my whole life, the way you miss a bad sweetheart. But you can miss a thing and not go back to it; every fence in the Hand knows that. (She pulls on her boots.) You know who I want to tell? Her. The lady. That it hurt, and I miss it, and I still wouldn’t go back.' },
      'sb-faced3': { speaker: 'narrator', text: 'The humming stops in the middle of a note, as if somebody had heard her. The pool goes grey and dull, and a skin of ice comes creeping out across it from the edges; and then the reeds and the bank and the pool all fall upward into the rain, and Sable is standing beside you on the Hollow Sea with her boots on.' },
      'sb-fled': { speaker: 'narrator', next: 'sb-fled2', text: 'She looks up at you, and for a moment you are not sure she knows who you are. Then she laughs and pulls her feet out and hops into her boots, one, two, chattering all the while about Cobb’s penny and the Hand and how you never let a girl have any fun. She does not look back at the pool. She is very careful not to. Behind you the humming goes on, and on.' },
      'sb-fled2': { speaker: SABLE, text: 'Don’t. I know. (She tucks her warm hands into her sleeves.) Some other night. I’ll tell you some other night, when it isn’t listening.' },
      // --- not saved: the water still wants her
      'sc-start': { speaker: 'narrator', next: 'sc-1', text: 'The memory is a pool among frozen reeds: black, smoking faintly in the cold, and it does not freeze. Sable is standing at the edge of it with her boots in her hand. Black tears run down her cheeks and she does not wipe them. Somewhere under the water a woman is singing.' },
      'sc-1': { speaker: SABLE, mood: 'hollow', next: 'sc-2', text: 'Ever so nice, isn’t it? Listen. (She tilts her head.) I dream this every night. Every night I get a bit nearer. Tonight I thought: well, love’s here. Love can watch. You don’t mind watching? You were always the mark.' },
      'sc-2': {
        speaker: SABLE, mood: 'afraid',
        text: '(And under it, very small, in her own voice:) Don’t let me go in smiling. You promised. Make me angry. Make me anything.',
        choices: [
          { text: '“Sable. Your knives are cheap Haldren tin.”', to: 'sc-angry', effects: decide(SABLE, 'faced', 8) },
          { text: '[Take her cold hand, and hold on]', to: 'sc-hold', effects: decide(SABLE, 'faced', 6) },
          { text: '“Wake up, Sable. Wake up!”', to: 'sc-fled', effects: decide(SABLE, 'fled') },
        ],
      },
      'sc-angry': { speaker: SABLE, mood: 'angry', next: 'sc-end', text: '(The smile falls off her face.) Tin? Tin? (She rounds on you, black-cheeked and spitting, the pool forgotten.) These are Brackhaven steel, you ignorant mark, I took them off a harbour-master— (She stops. She is three paces from the water and has no idea how she got there.) …Oh. You rotten thing. That was on purpose.' },
      'sc-hold': { speaker: 'narrator', next: 'sc-end', text: 'You take her cold hand and do not let go. She pulls once toward the water, with a strength no slight woman should have; then again, weaker; then not at all. You stand on the bank together until the singing has worn itself out.' },
      'sc-end': { speaker: SABLE, mood: 'sad', text: 'Still here. Still me, mostly. (She wipes the black off her cheek and looks at it.) Whatever you’re going to do about me, love, do it soon. I’ve not so many of these nights left.' },
      'sc-fled': { speaker: 'narrator', text: 'You shout, and the dream tears like wet paper, and you are both standing on the Hollow Sea in the upward rain. Sable is shaking. She does not remember the dream, she says. She is lying; her boots are still in her hand.' },
    },
  }),

  // ================================================================ 4. CADOC AND YS
  dream({
    n: 4, npc: CADOC, label: 'Cadoc and Ys',
    echo: 'A bell no bigger than a thimble hangs upside down above the water, ringing one note, slow, never quite making a tune.',
    faced: 'The little bell has stopped ringing. It hangs over the water quite still, the way a bell hangs in a house where everyone has finally gone to sleep.',
    fled: 'The little bell is still ringing, one note, slow, and every so often a second note answers it from very far below.',
    starts: [{ node: 'c-start' }],
    nodes: {
      'c-start': { speaker: 'narrator', next: 'c-1', text: 'The memory is a lake turned over. The Hollow Sea has become the sky, and hanging from it upside down, white towers slumped like candles left too near the fire, is Ys Aerwen, every belfry ringing. On a white stair that climbs up into the water stands a small Aelthi boy, knee-high to a birch, with a scab on his knee from the hedge. Beside you, Cadoc has stopped walking.' },
      'c-1': {
        speaker: CADOC,
        text: 'Ah. (Very dry, and not quite steady.) That is me. I was rather sweet. Don’t tell anyone. (He watches the boy begin to climb.) I know this one, spark. I have had it for two hundred years. I sing, and something drowns. It is the only dream I have.',
        choices: [
          { text: '[Watch]', to: 'c-sung', when: is(VERSE, 'sung') },
          { text: '[Watch]', to: 'c-left', when: is(VERSE, 'left') },
          { text: '[Watch]', to: 'c-plain', when: not(f(VERSE)) },
        ],
      },
      'c-sung': { speaker: 'narrator', next: 'c-sung2', text: 'The boy climbs into the water and begins to sing: the whole of the Lullaby, and then the last verse, the one Eluned gave you under the lake. Mi gwyl, mi gwyl, ni hun. I keep the watch, I do not sleep. The bells of Ys stop one by one, and in the silence after them you see whom the verse is keeping: you. Far down, under everything, alone by a red fire in the dark, keeping the watch for ever while the world sleeps above you and forgets your name.' },
      'c-sung2': { speaker: CADOC, mood: 'sad', next: 'c-choice', text: 'I gave you that. The verse. The door. (He does not look at you.) I told you a line is not a door, only the shape of one. And then I went down into a lake and fetched the whole door up and put it in your hands. I decided to mind, spark. And then I taught the one I minded the only song that keeps a spark burning alone at the bottom of the world.' },
      'c-left': { speaker: 'narrator', next: 'c-left2', text: 'The boy climbs into the water and stops halfway, where the treads go green, and listens. From the singing-hall below a single voice is singing past the place where the song ends: Eluned, keeping her verse where it cannot hurt anyone. “Cadi,” she calls, not unkindly. “Cadi, come down and fetch the rest.” The boy turns round and climbs back up into the cold. Then he goes down again. Then up.' },
      'c-left2': { speaker: CADOC, mood: 'sad', next: 'c-choice', text: 'I left her there. It was the right thing; I am almost certain it was. (A breath.) And she will sing it alone until the lake freezes, and every Aelthi child brought to that shore to cry will be crying for something I could have ended, if I had not been so afraid of ending things.' },
      'c-plain': { speaker: 'narrator', next: 'c-plain2', text: 'The boy climbs into the water and begins to hum: not the words, only the tune, under his breath, the way his mother hummed it for nine days on her deathbed. The bells of Ys answer him. And the white towers, which have stood two thousand years, begin very slowly to soften, and lean, and sink, because a boy is humming, because he cannot bear to be the only one who knows.' },
      'c-plain2': { speaker: CADOC, mood: 'sad', next: 'c-choice', text: 'She taught me on the tenth day, and then she stopped. And I told someone, because I could not bear to be alone with it. (He watches the towers go down.) Every song I have ever sung has had something drowned at the bottom of it. My people. Hers. One day it will be you.' },
      'c-choice': {
        speaker: 'narrator', text: 'On the stair, the boy has stopped and is looking down at you through the upside-down water, with Cadoc’s eyes. He is waiting to be told whether to go on.',
        choices: [
          { text: '“Let him finish, Cadoc. All of it. And listen to what the song actually says.”', to: 'c-faced', effects: decide(CADOC, 'faced', 8) },
          { text: '“You don’t get to carry that for me. I chose it. I’d choose it again.”', to: 'c-mine', when: is(VERSE, 'sung'), effects: decide(CADOC, 'faced', 10) },
          { text: '“Come away. Don’t watch it again.”', to: 'c-fled', effects: decide(CADOC, 'fled') },
        ],
      },
      'c-mine': { speaker: CADOC, next: 'c-faced', text: '(He turns and stares at you, and for once has nothing whatever to say. Then:) That is the most human thing anyone has ever said to me, and I have been insulted by a great many humans. (Quietly.) You do not even know yet what it costs. …No. You do. You have always known. That is what is so unbearable about you.' },
      'c-faced': { speaker: 'narrator', next: 'c-faced2', text: 'Cadoc lifts his face to the boy, and the boy begins again, and this time Cadoc sings with him under his breath, the whole of it, to the end. It is a lullaby. It has a mother in it, sitting up by the bed so the child can sleep. It does not drown anything. It never did; the drowning was the sea underneath, which has never once been able to sing it. The towers stop sinking. The bells, one by one, fall quiet. The boy yawns enormously, the way children do, and goes up into the water, and is gone.' },
      'c-faced2': { speaker: CADOC, text: '(After a long while.) I sang the fourth line flat. (He laughs, shakily.) Of course I did. Two hundred years of this dream and I had never once got to the end. It ends with somebody going to sleep, spark, and somebody else keeping the fire. (He looks at your hand.) I had forgotten that the second part was the kind part.' },
      'c-fled': { speaker: 'narrator', next: 'c-fled2', text: 'You take him by the sleeve, and he lets you lead him off, the way the Aelthi let one lead them when they are grieving: politely, as though it were your idea. Behind you the boy on the stair takes a breath to sing. You do not hear what comes after. Neither does Cadoc. He is very careful about that.' },
      'c-fled2': { speaker: CADOC, text: 'Thank you. That was cowardly of us both, and I am grateful. (Lightly; too lightly.) I shall have it again tonight, of course. I always do. I am, as you know, very good at sitting at the edge of things.' },
    },
  }),

  // ================================================================ 5. GRIMMA AND THE EMPTY SOCKET
  dream({
    n: 5, npc: GRIMMA, label: 'Grimma and the empty socket',
    echo: 'An iron ring hangs in the black water, cut clean in two. The halves drift toward each other, very slowly, like lodestones, and never quite meet.',
    faced: 'The cut ring has sunk. Where it went down, the water is perfectly still, and dry stone shows through it like the rim of a well that has been capped.',
    fled: 'The halves of the ring are still drifting toward each other through the water, wanting, and never meeting.',
    starts: [{ node: 'g-start' }],
    nodes: {
      'g-start': { speaker: 'narrator', next: 'g-1', text: 'The memory is the Vault of the Nine Nails, made of black water and remembered iron: the seven Nails humming their one low note, and between them the Ninth socket, a well as wide as a village green, its rim a crust of red flakes soft as old bark. Grimma is standing at the bottom of it with the black water at her knees. Round the rim, far above her, in rows, the whole of Clan Ironsong is looking down.' },
      'g-1': {
        speaker: GRIMMA, mood: 'angry',
        text: '(Without looking up.) Don’t come down, human. There’s no room. It’s a socket; it takes one Nail. (She laughs, not kindly.) Guess who’s the Nail.',
        choices: [
          { text: '[Look closer]', to: 'g-nail', when: f('act2.new_nail') },
          { text: '[Look closer]', to: 'g-flood', when: all(f('act2.korrath_flooded'), not(f('act2.new_nail'))) },
          { text: '[Look closer]', to: 'g-plain', when: all(not(f('act2.korrath_flooded')), not(f('act2.new_nail'))) },
        ],
      },
      'g-nail': { speaker: 'narrator', next: 'g-ulka', text: 'You see it now. She is not standing in the socket; she is driven into it. Her braid of iron rings runs down her back like the runes down a Nail’s shaft, and on the crown of her head, where a Nail’s head would be, burns her own mark, the colour of a fresh forge. As you watch, it rusts. In a breath. In the time it takes to say grenn. Red flakes fall from her shoulders into the black, and the water comes up an inch.' },
      'g-flood': { speaker: 'narrator', next: 'g-ulka', text: 'And the black water is not only in the socket. It has come up through the Vault and out into the holds, into Korrath under stone, into the Ironsong ledger-hall where her name was scratched out of the old book; and the book is down there now, open, its pages lifting in the dark. Hers is the only hole in the mountain that is not full. She is holding it shut with her knees.' },
      'g-plain': { speaker: 'narrator', next: 'g-ulka', text: 'The rings in her braid are rusting, one by one, from the bottom up. Each goes red, and soft, and drops into the water with a small sound, like a coin into a well. She does not look down at them. She is very carefully not looking down.' },
      'g-ulka': {
        speaker: ULKA,
        text: '(From the rim, a voice like a hammer laid down on an anvil: Ulka Ironsong, clan-mother, with a chisel in her hand.) What the hold knows, the hold keeps. You did not keep. You told the gate, and the humans, and the mountain its own shame out loud. Grenn on you, sister’s daughter. You did not hold.',
        choices: [
          { text: '[Listen]', to: 'g-old', when: is(RING, 'old') },
          { text: '[Listen]', to: 'g-new', when: is(RING, 'new') },
          { text: '[Listen]', to: 'g-none', when: is(RING, 'none') },
          { text: '[Listen]', to: 'g-cut', when: not(f(RING)) },
        ],
      },
      'g-old': { speaker: GRIMMA, mood: 'sad', next: 'g-choice', text: 'She mended it. You saw. Struck the first blow herself, and her hand didn’t shake. And every night down here she cuts it again, and every night I let her, because I keep thinking: what if she was right the first time.' },
      'g-new': { speaker: GRIMMA, mood: 'sad', next: 'g-choice', text: 'I forged it new, in your fire, not the clan’s. And every night down here she looks at it and says: that is not Ironsong iron, that is jewellery. And every night I think she’s right, and I’ve made myself a pretty thing to wear instead of a name.' },
      'g-none': { speaker: GRIMMA, mood: 'sad', next: 'g-choice', text: 'I told her no. Stood in front of the whole clan and refused it. Grand, it was. (Her voice cracks.) And every night down here they turn their backs on me, one by one, all the way round the rim, till there’s nobody looking. And the water comes up. Because a Nail nobody’s watching is just a bit of iron in a hole.' },
      'g-cut': { speaker: GRIMMA, mood: 'sad', next: 'g-choice', text: 'She cut my ring. Clean as a loaf. And every night down here she cuts it again, and I stand and let her, because what if she’s right. What if I’m the thing that didn’t hold.' },
      'g-choice': {
        speaker: 'narrator',
        text: 'The black water is at her waist. It is not cold. It rises and falls, slowly, the way a chest rises and falls in sleep, and every time it falls it says, in no words: let go. You were never iron. Lie down, and let the mountain have its silence back.',
        choices: [
          { text: '“Korr nagh, Grimma. You told me what it means. Say it. Say it to her.”', to: 'g-faced', effects: decide(GRIMMA, 'faced', 8) },
          { text: '[Warden] Climb down beside her, set your back to the rim, and hold.', to: 'g-warden', when: { classIs: 'class:warden' }, tag: 'class', effects: decide(GRIMMA, 'faced', 10) },
          { text: '[Reach down and haul her out]', to: 'g-fled', effects: decide(GRIMMA, 'fled', 2) },
        ],
      },
      'g-warden': { speaker: 'narrator', next: 'g-faced', text: 'You climb down into the socket beside her, though there is no room, and set your back against the rusted rim and your heel against the stone, the way a Warden is taught to hold a line. The water does not care. Grimma looks at you as if you have gone mad. Then she sets her shoulder against yours.' },
      'g-faced': { speaker: GRIMMA, mood: 'angry', next: 'g-faced2', text: '(She lifts her head and looks up at the rim, at the clan, at the woman with the chisel, and she does not shout. It is worse that she does not shout.) Korr nagh. I will hold. I held when I told the gate. That was holding, Ulka. Keeping quiet while the Nails rotted: that was rust. You wrote grenn on the wrong one of us.' },
      'g-faced2': { speaker: 'narrator', next: 'g-faced3', text: 'On the rim the clan-mother lowers her chisel. Nobody says anything; nobody ever says anything in an Orrun dream, you suspect, they only stand. But the water in the socket stops rising, and then, very slowly, it goes down: past her waist, past her knees, down into the dark under the stone, until she is standing on dry rock with her braid clinking and red flakes lying round her boots like old leaves.' },
      'g-faced3': { speaker: GRIMMA, text: '(She climbs out, and does not take your hand, and then does, at the top.) Hm. That wants writing down. (She does not write it down. She stands a moment with her hand on your shoulder, heavy as a hammer.) Don’t tell anyone I said korr nagh to a dream. I’ve a reputation. It’s mostly for being rude.' },
      'g-fled': { speaker: 'narrator', next: 'g-fled2', text: 'You reach down and take her by the wrist, and haul. She is very heavy, as Orrun are, and the water does not want to give her up. She comes out of the socket in a rush of black and red flakes, cursing, and the two of you sprawl on the rim at the clan’s feet. When you look up there is nobody there. There is only the Hollow Sea, and the rain going up.' },
      'g-fled2': { speaker: GRIMMA, mood: 'angry', text: 'You pulled me out. (She gets up, slowly.) Aye. Well. That’s one column of the ledger. (She does not say what is in the other, and she does not look back.) It’ll be there tomorrow. Holes are patient.' },
    },
  }),

  // ================================================================ 6. VESPER AND THE BURNING ABBEY
  dream({
    n: 6, npc: VESPER, label: 'Vesper and the burning abbey',
    echo: 'A flame burns in the air above the water with no candle under it: only a small hollow of smoke the shape of a fingertip.',
    faced: 'The fingertip of smoke has gone. In its place, floating on the water, is a length of red thread tied in a bow.',
    fled: 'The flame still burns in its hollow of smoke, and under it, very faintly, you can hear buckets, and women shouting, and a bell.',
    starts: [{ node: 'v-start' }],
    nodes: {
      'v-start': { speaker: 'narrator', next: 'v-1', text: 'The memory is a chapel on fire: the Abbey of Saint Sabine at Aurenac, the night Vesper burned it. The roof is alight, sisters in their shifts run with buckets from the well, the bell goes mad in the tower. The fire is made of the Mire, black water burning black, and the rain falls upward through it and does not put it out. In the chapel door stands Vesper in a sister’s grey, twenty-three years old, with ash on her hands. Beside you, the Vesper you know has gone very quiet.' },
      'v-1': { speaker: VESPER, next: 'v-2', text: 'Twenty years. (She laughs, and is not amused.) I always hoped I would be braver in the dream. Look at her. She has it all decided. She is going to get the girl to the wall, and come back, and stand in the middle of it, and it is going to be very clean.' },
      'v-2': { speaker: 'narrator', next: 'v-novice', text: 'Across the cloister, on top of the wall, the novice is waiting: fourteen, soot-black, with a flame burning on the end of her finger to see by. She is not holding out her hand. In the dream she never holds out her hand. She is watching the chapel door, waiting for the young Vesper to go back inside.' },
      'v-novice': {
        speaker: NOVICE,
        text: '(Her voice carries across the cloister, very clear.) Go on, Sister. Go on back in. You meant to. I won’t stop you. Nobody will ever stop you.',
        choices: [
          { text: '[Watch]', to: 'v-glass', when: f('act2.vesper_held_glass') },
          { text: '[Watch]', to: 'v-wick', when: all(not(f('act2.vesper_held_glass')), is('act2.church_stance', 'pledged')) },
          { text: '[Watch]', to: 'v-plain', when: all(not(f('act2.vesper_held_glass')), not(is('act2.church_stance', 'pledged'))) },
        ],
      },
      'v-glass': { speaker: VESPER, mood: 'afraid', next: 'v-choice', text: 'And now it spreads. Watch. (The fire leaps the cloister. It goes red-orange, Ashvar’s colour, the colour of the Ember of the Glass she held for a night, and it takes the dormitory, and the barns, and the village below, and the road.) What if everyone is me. I said that, at the throne. I thought it was wisdom. It is only this: one woman setting fires, everywhere, for everyone, for ever.' },
      'v-wick': { speaker: VESPER, mood: 'angry', next: 'v-choice', text: '(Through the smoke at the gate the Wick is coming at dawn, as it came: grey cloaks, a lantern. The inquisitor at their head turns, and it is your face under the hood, with Vellane’s seal at your breast.) Oh, of course. Of course it is. Kind, right up to dawn.' },
      'v-plain': { speaker: VESPER, mood: 'sad', next: 'v-choice', text: 'I got her out. Nobody died; I made sure of it. And every night down here I count the sisters at the well, and every night there is one short, and it is me, and I am relieved. (She looks at the burning door.) That is the dream. Not the fire. The relief.' },
      'v-choice': {
        speaker: 'narrator', text: 'The young Vesper turns in the doorway and looks back into the fire. It is very beautiful. It would be very clean. On the wall, the novice lowers her burning finger and does not reach out.',
        choices: [
          { text: '“Then you reach out, Vesper. You. Go to the wall and hold out your hand to her.”', to: 'v-faced', effects: decide(VESPER, 'faced', 8) },
          { text: '[Arcanist] Call the fire out of the chapel into your own hand, and close your fist on it.', to: 'v-arc', when: { classIs: 'class:arcanist' }, tag: 'class', effects: decide(VESPER, 'faced', 10) },
          { text: '“It’s twenty years gone. You needn’t watch it. Come away.”', to: 'v-fled', effects: decide(VESPER, 'fled', -2) },
        ],
      },
      'v-arc': { speaker: 'narrator', next: 'v-faced', text: 'You put out your marked hand and call the fire, and it comes, all of it, black and roaring, across the cloister and into your palm, and you close your fist on it. It hurts the way fire is supposed to hurt. The chapel stands smoking and empty. In the doorway the young Vesper stares at you as though you were a saint in a window.' },
      'v-faced': { speaker: 'narrator', next: 'v-faced2', text: 'Vesper walks across the cloister of Aurenac, through the sisters and their buckets, through the smoke, and climbs the wall. She does not look back at the chapel. At the top she holds out her hand to the girl with the flame on her finger, the way a child once held out a hand to her. The novice looks at it a long moment. Then she takes it.' },
      'v-faced2': { speaker: NOVICE, mood: 'happy', next: 'v-faced3', text: '(Shyly.) You came over the wall, Sister. I didn’t know if you would. I didn’t know anybody could.' },
      'v-faced3': { speaker: VESPER, text: '(The fire goes out behind her all at once, like a candle pinched. The abbey falls up into rain. She stands on the Hollow Sea with her hand still held out to nobody, and after a while she lowers it.) I was not strong enough to refuse a child. For twenty years I have called that my weakness. (She clears her throat, fiercely.) It may have been the one thing I ever did right. Don’t tell anyone. I have a reputation.' },
      'v-fled': { speaker: 'narrator', next: 'v-fled2', text: 'Vesper turns her back on Aurenac the way she does everything, fast and decided, and walks off across the black water without looking round. Behind you the bell goes on ringing in the burning tower, and the young woman in the doorway goes back inside, and the girl on the wall watches her go.' },
      'v-fled2': { speaker: VESPER, mood: 'angry', text: 'Don’t manage me. I know what you did. (A breath.) …Thank you. I could not have watched the end of it. I never have. I suppose that is the point of a dream: it waits until you can.' },
    },
  }),

  // ================================================================ 7. HESTA AND THE GIRL YSOLDE
  dream({
    n: 7, npc: HESTA, label: 'Hesta and the girl Ysolde',
    echo: 'A candle burns in a window that has no house round it: four panes of old glass, a sill, a stub of tallow, hanging in the air above the black water.',
    faced: 'The window still hangs over the water, but the candle in it has burned down to the dish and gone out, the way a candle does when whoever it was waiting for has come home.',
    fled: 'The window is dark. Somebody has pinched out the candle and left the wick smoking, and it is still smoking, and it does not stop.',
    starts: [{ when: hestaAlive, node: 'h-start' }],
    nodes: {
      'h-start': { speaker: 'narrator', next: 'h-1', text: 'The memory is a window: a house on a hill somewhere in the Haldmarch that has not stood for thirty years. A kitchen, a fire, a table heaped with Warden ledgers, and in the window a candle for somebody late home from the leys. It is night. It is always night here. At the table sits Hesta, younger by thirty years and not one whit softer, writing a letter with a burned hand.' },
      'h-1': { speaker: HESTA, mood: 'angry', next: 'h-girl', text: '(The real one, beside you, coughs.) Oh, for pity’s sake. Not this one. I’d sooner the one with the Wick and the torches. (She does not move to go.) I could tell you what she says next. I could tell you every word.' },
      'h-girl': { speaker: 'narrator', next: 'h-y1', text: 'The door opens on snow, and a girl comes in: twelve or thirteen, thin as a lath, with ley-stone dust on her knees and frost in her hair. Late, again, the way she was always late. Ysolde Maerin, before anybody made her a saint. She goes straight to the fire and holds out her hands to it.' },
      'h-y1': { speaker: GIRL, mood: 'happy', next: 'h-2', text: 'I’m sorry, Mistress. I lost the hours. There’s a stone above the beck that hums if you put your ear to it, and I was listening, and then the candle was lit. (She turns round, glowing with cold.) It sings, Mistress. Under the stone. Something very far down, and it’s so sad. Should I listen harder? Should I find out what it is?' },
      'h-2': { speaker: HESTA, mood: 'sad', next: 'h-choice', text: '(Beside you, low.) And I say yes. Every night. Look properly, girl. See where it comes from. (Her hands have closed into fists.) I said it then, and I wrote it to her again when they made her Keeper, and in thirty years I have never once dreamed I said anything else.' },
      'h-choice': {
        speaker: 'narrator', text: 'At the table the younger Hesta has put down her pen and is opening her mouth to answer. The candle in the window gutters, though there is no draught. Outside, on the snow, the water is coming up round the walls of the house, very gently.',
        choices: [
          { text: '“Then say something else, Hesta. Tell her the truth. Tell her what you were afraid of.”', to: 'h-faced', effects: decide(HESTA, 'faced', 10) },
          { text: '“You don’t have to hear it again. Put the candle out. Let’s go.”', to: 'h-fled', effects: decide(HESTA, 'fled', -2) },
        ],
      },
      'h-faced': { speaker: 'narrator', next: 'h-f2', text: 'Hesta gets up: the old one, the real one, with her cough and her burned arms. She walks into the memory past her younger self as if past a piece of furniture, and kneels in front of the girl by the fire, which costs her a great deal, and takes the small cold hands in her hot ones.' },
      'h-f2': { speaker: HESTA, mood: 'sad', next: 'h-f3', text: 'No. Listen to me. No. Don’t listen harder. It isn’t singing, girl. It’s hungry, and it has learned that a sad song is the quickest way into a kind heart. I know, because it sang to me first, and I was afraid of it, and I never told you. I let you think I was only cross. (Her voice goes.) I was frightened, and I should have said so. Come in by the fire. Eat something.' },
      'h-f3': { speaker: GIRL, mood: 'sad', next: 'h-f4', text: '(The girl looks at her a long time, the way children look at grown people who have suddenly told them the truth.) I knew you were frightened, Mistress. I always knew. I only wanted you to be brave for me, so I needn’t be. (She leans her frosty head on Hesta’s shoulder.) I’m home now. You can put the candle out.' },
      'h-f4': { speaker: 'narrator', next: 'h-f5', text: 'Hesta does not put the candle out. She sits on the kitchen floor of a house that has not stood for thirty years with a dream in her arms, until the dream is only warmth, and then only the memory of warmth; and then the house falls upward into the rain, the candle last of all, still lit.' },
      'h-f5': { speaker: HESTA, text: '(She gets up off the black water without your help, which takes a while.) Well. That’s the first time I’ve said it. Out loud. To anyone. (She glares at you, red-eyed.) Tell a soul and I’ll have your other hand. …She’s at the end of this road. The real one. I’ll say it to her too, if she’ll let me. I owe her that. I owe her the whole of it.' },
      'h-fled': { speaker: 'narrator', next: 'h-fl2', text: 'Hesta reaches past her younger self and pinches out the candle in the window between finger and thumb. It hisses. The girl by the fire turns, surprised, and the house goes dark, and then it is only a window hanging over the black water, its wick smoking.' },
      'h-fl2': { speaker: HESTA, mood: 'angry', text: 'There. Done. (She shakes her burned fingers.) I’ve had thirty years of that dream; I’ll have thirty more if I live, which I shan’t. Don’t look at me like that. Some things you don’t mend, child. You only stop lighting candles for them.' },
    },
  }),
];

export default dialogues;
