/**
 * Hollow Crown, OATHBOUND Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation beats, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
/** the Gilded March keeps the ordinary night (08 R30) */
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const IL = 'npc:ilsabet' as const, AS = 'npc:aurelian-sterling' as const, MS = 'npc:marjory-stook' as const;
const WC = 'npc:wystan-crake' as const, GL = 'npc:gammer-lisle' as const, CW = 'npc:clover-wheatley' as const;
const CL = 'npc:cuthbert-lowe' as const, HG = 'npc:hamish-at-the-gate' as const;

/** an object beat: one scene while its stage runs (sets its flag), a plain line otherwise */
function beat(id: string, name: string, when: NarrativeCondition, text: string, flag: string, plain: string, more?: string): DialogueDef {
  return {
    id: `dialogue:obj-${id}`, name, scope: 'party',
    entries: [{ when, node: 'beat' }, { node: 'plain' }],
    nodes: {
      beat: { speaker: 'narrator', text, effects: [{ setFlag: flag, value: true }], next: more ? 'more' : null },
      ...(more ? { more: { speaker: 'narrator', text: more, next: null } } : {}),
      plain: { speaker: 'narrator', text: plain, next: null },
    },
  };
}

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Vigil: the empty bracket
  beat('oathbound-empty-bracket', 'I-1 the empty bracket', stage('quest:oathbound-the-vigil', 'bracket'),
    'A sword-bracket by the Hall door with no sword in it, still ringing faintly, as if it remembered the note. The ribbon tied to it is newer than the rest, in Ser Beatrix’s square hand: ILSABET. C. 1012. GONE TO THE TURNING.',
    'oathbound.empty_bracket', 'An empty sword-bracket by the Hall door, quiet now.', 'Every other ribbon in the Hall names a field where a sword was broken. This one names a place somebody walked to, and did not come back from.'),

  // ======================= I-2 / I-3 travel banter
  {
    id: 'dialogue:area-oathbound-haybright-road', name: 'I-2 banter: down to Haybright', bark: true,
    entries: [{ when: stage('quest:oathbound-no-village-alone', 'reeve'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Halfway to Haybright, the light goes thin at the edges, like a page held up to a window. Your shadow, for the first time in your life, is longer than you are.', next: null } },
  },
  {
    id: 'dialogue:area-oathbound-lion-road', name: 'I-3 banter: up the bitten road', bark: true,
    entries: [{ when: stage('quest:oathbound-the-lions-gate', 'road'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Every waymark on the road has had its top bitten clean off. Some of the stumps still have tooth-marks the size of your hand. On one, somebody has chalked an arrow and the words: STILL THIS WAY, PROBABLY.', next: null } },
  },

  // ======================= I-4 The Sorrow-Oath: following Ilsabet to the milestone
  {
    id: 'dialogue:area-oathbound-milestone-walk', name: 'I-4 banter: behind Ilsabet’s column', bark: true,
    entries: [{ when: stage('quest:oathbound-the-sorrow-oath', 'follow'), node: 'b' }],
    nodes: { b: { speaker: IL, mood: 'happy', text: '(Up ahead, to the children, in a clear tired voice.) And the knight said to the dragon, I have sworn to cross this bridge, and you have sworn to stop me, so we had better both be polite about it. Again? All right. Once more.', next: null } },
  },

  // ======================= I-5 The Oath Moot: Stook and Sterling before the Moot, the outcomes
  {
    id: 'dialogue:oathbound-stook-canvass', name: 'I-5 Reeve Stook before the Moot', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: MS, text: '“Night-touched.” (She says it the way you would say a word with mud on it.) That’s every soul in Haybright who stood in the street and looked up. That’s me. That’s Pym. That’s little Clover, who’s naming the stars.', effects: [{ setFlag: 'oathbound.stook_asked', value: true }], next: 'cleansing' },
      cleansing: {
        speaker: MS, text: 'And “cleansing in the light”. Nobody will say what it is. Pym asked. They gave him a loaf.',
        choices: [
          { text: 'What would you say at the Moot, if they let you?', to: 'say' },
          { text: 'The Order is sworn to the Hierarch.', to: 'sworn' },
        ],
      },
      say: { speaker: MS, text: 'That we brought the wheat in by the light we had, and nobody died of the dark. That’s all. Short, true, and nobody can argue with it, which is why they won’t let me say it.', next: 'end' },
      sworn: { speaker: MS, mood: 'angry', text: 'And to us. “No village shall stand alone.” I had that read to me at my naming. It’s on the stone in our square. Somebody in that fortress swore it to Haybright, and Haybright remembers.', next: 'end' },
      end: { speaker: MS, text: 'I’ll be outside the stones with the rest. If they make me go, I go with my head up. If they don’t, I’d like a cart back by Thursday. Wheat doesn’t wait.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-sterling-canvass', name: 'I-5 Captain Sterling before the Moot', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: AS, text: 'The Oathbound recruit. Good. Somebody I can be honest with who isn’t a horse. (He lowers his voice.) I have read this decree forty times on the road from Dawnspire. It gets heavier every time.', effects: [{ setFlag: 'oathbound.sterling_asked', value: true }], next: 'heavy' },
      heavy: {
        speaker: AS, text: '“Cleansing in the light” means a room in the Brightwatch House with the lamps turned up, and the door shut, until they stop remembering. Some of them stop remembering a great deal.',
        choices: [
          { text: 'Then why carry it?', to: 'why' },
          { text: 'Would you refuse, if you could?', to: 'refuse' },
        ],
      },
      why: { speaker: AS, mood: 'sad', text: 'Because I was told to, and being told to is the only thing I have ever been good at. My father carried decrees. His father carried decrees. We are a family of very careful carriers.', next: 'end' },
      refuse: { speaker: AS, mood: 'afraid', text: 'I can’t. I swore. (He looks at the oath-stones.) But you lot swore things too, didn’t you. Older things. If one of your stones said something I couldn’t argue with, I wouldn’t argue. I’d be very relieved.', next: 'end' },
      end: { speaker: AS, text: 'Please don’t tell anyone I said any of that. I’m terribly sorry. I’m always terribly sorry. It’s the only thing they let us keep.', next: null },
    },
  },
  {
    id: 'dialogue:obj-oathbound-escort-carts', name: 'I-5 the escort carts at Haybright', scope: 'party',
    entries: [{ when: stage('quest:oathbound-the-oath-moot', 'escort'), node: 'carts' }, { node: 'plain' }],
    nodes: {
      carts: {
        speaker: 'narrator', text: 'The carts stand in Haybright’s square, with the night-touched sitting in them very straight, holding bundles. Marjory Stook sits in the first cart with her arms folded. Clover is in the third, waving at you, because nobody has told her not to.',
        choices: [
          { text: '(Give the order to move, gently.)', to: 'move' },
          { text: '(Give the order, and ride beside Clover’s cart.)', to: 'ride' },
        ],
      },
      move: { speaker: 'narrator', text: '“Move on,” you say. The carts move. Nobody cries, which is worse. As the last one rolls out of the square, Stook turns round and looks at you, and nods once, as if to say: well, you kept it. Keep it well.', next: null },
      ride: { speaker: 'narrator', text: 'You ride beside the third cart all the way to the March road. Clover tells you the name of every star she has named, and you promise to remember them, and that, at least, is an oath you can keep.', next: null },
      plain: { speaker: 'narrator', text: 'The square at Haybright, with cart-ruts going east.', next: null },
    },
  },
  {
    id: 'dialogue:obj-oathbound-march-line', name: 'I-5 the Order’s line at the Dimming’s edge', scope: 'party',
    entries: [{ when: stage('quest:oathbound-the-oath-moot', 'stand'), node: 'line' }, { node: 'plain' }],
    nodes: {
      line: {
        speaker: 'narrator', text: 'The Dimming’s edge, with the villages behind you and the white Brightwatch road in front. Every knight of Oathkeep is behind you on horseback, waiting. Somebody has to plant the first lance. They are all looking at the newest knight.',
        choices: [
          { text: '(Plant it, and say the old oath: no village shall stand alone.)', to: 'oath' },
          { text: '(Plant it, and say nothing at all.)', to: 'quiet' },
        ],
      },
      oath: { speaker: 'narrator', text: '“No village of the March shall stand alone.” Three hundred knights say it back to you, all at once, and the lances go down into the earth one after another all along the edge of the dark, like a fence being built out of promises.', next: null },
      quiet: { speaker: 'narrator', text: 'You plant it and step back. Nobody says anything. Then Beatrix rides up beside yours and plants hers, and then the next, and the next, all along the Dimming’s edge, in silence, which is louder.', next: null },
      plain: { speaker: 'narrator', text: 'A line of lances planted along the Dimming’s edge, pennants stirring.', next: null },
    },
  },

  // ======================= I-6 travel banter
  {
    id: 'dialogue:area-oathbound-chapel-path', name: 'I-6 banter: the path to the Forsworn Chapel', bark: true,
    entries: [{ when: stage('quest:oathbound-the-forsworn-chapel', 'chapel'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Along the chapel path, the Order has set a stone for every knight it ever struck from the roll. They have been set face down, so the names cannot be read. Somebody has turned one over, and put a flower on it.', next: null } },
  },

  // ======================= I-7 To Whoever Wears It: Ilsabet’s camp
  beat('oathbound-ilsabet-camp-1', 'I-7 Ilsabet’s camp (1)', stage('quest:oathbound-to-whoever-wears-it', 'camp'),
    'Her saddle-roll, packed with soldierly neatness. Folded inside it, flattened by years, a sheaf of drawings in crayon: a knight on a grey horse, drawn by a dozen different children from a dozen different villages, every one of them very proud of the horse.',
    'oathbound.camp_1', 'A neat square of flattened grass where a saddle-roll lay.'),
  beat('oathbound-ilsabet-camp-2', 'I-7 Ilsabet’s camp (2)', stage('quest:oathbound-to-whoever-wears-it', 'camp'),
    'A whetstone worn into a saddle shape by thirty years of use, and wrapped round it, faded almost white, a squire’s ribbon. Stitched on it: B. H., and a date from the year they were both sworn.',
    'oathbound.camp_2', 'A cold fire-ring in the Dimming.'),
  beat('oathbound-ilsabet-camp-3', 'I-7 Ilsabet’s camp (3)', stage('quest:oathbound-to-whoever-wears-it', 'camp'),
    'Under the saddle-roll, weighted with a stone, a letter in a clear upright hand. It has been started many times. Every start is crossed out but the last, which is only one line long: “Bea. I kept it. I.”',
    'oathbound.ilsabet_letter', 'The place where Ilsabet camped, empty now.', 'She meant to send it. She has been meaning to send it for thirty years. It is the only oath you have heard of that she has not kept.'),

  // ======================= I-9 The March Road: the last waymark
  {
    id: 'dialogue:obj-oathbound-march-end-stone', name: 'I-9 the last waymark of the March', scope: 'party',
    entries: [{ when: stage('quest:oathbound-the-march-road', 'endstone'), node: 'stone' }, { node: 'plain' }],
    nodes: {
      stone: { speaker: 'narrator', text: 'The last waymark of the Gilded March, taller than the rest, its gold worn thin by a thousand years of hands. On the front: THE MARCH ENDS HERE. On the back, cut deep: TRAVELLER, KEEP.', next: 'keep' },
      keep: {
        speaker: 'narrator', text: 'It does not say keep what. Every Oathbound who rides past it is supposed to decide.',
        choices: [
          { text: '(Touch it, the way the knights do, and ride on.)', to: 'touch', effects: [{ unlockLore: 'lore:hc-radiance-march-end' }] },
          { text: '(Say your vigil words to it.)', to: 'words', effects: [{ unlockLore: 'lore:hc-radiance-march-end' }] },
        ],
      },
      touch: { speaker: 'narrator', text: 'The gold is warm under your glove. Beyond it the road goes on east towards the Dawn Gate, ungilded, no waymarks at all. From here on, it seems, you will have to keep the road yourself.', next: null },
      words: { speaker: 'narrator', text: '“And I shall keep…” You finish the line in your own words, the same as at the vigil. Nobody hears it but the stone. That seems right. The stone has heard every one of them.', next: null },
      plain: { speaker: 'narrator', text: 'The last waymark of the March: TRAVELLER, KEEP.', next: null },
    },
  },

  // ======================= Side: the Squire Who Swears Too Much (the oath-book in the Hall)
  {
    id: 'dialogue:oathbound-wystan-book', name: 'The Squire: Hamish’s oath-book in the Hall', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: WC, text: 'A book? In the Hall of Broken Swords? (He turns it over in his hands, and opens it, and reads oath number forty: “I swear I’ll grow a beard by spring.”) The boy is fifteen.', next: 'read' },
      read: {
        speaker: WC, text: '(He reads on, for a long time, and stops laughing about halfway through.) Number one hundred and two. “I swear I’ll look after Mam now Da’s gone.” (He closes it.) This isn’t a book of broken oaths. Half of these he’s keeping.',
        choices: [
          { text: 'He thinks he’ll never keep most of them.', to: 'most' },
          { text: 'Hang it anyway. So nobody forgets they were sworn.', to: 'hang', trust: 1, trustNpc: WC },
        ],
      },
      most: { speaker: WC, mood: 'sad', text: 'None of us keep most of them. That’s what the Hall is for. (He finds a nail.) I’ll hang it by the door, low, where a squire can reach it to add to it. He’ll want to add to it.', next: null },
      hang: { speaker: WC, mood: 'happy', text: '(He hangs it on a nail between two broken swords, as carefully as if it were one.) There. Ser Hamish Goodbody, two hundred and thirteen oaths, a great many of them about porridge. The Hall is honoured.', next: null },
    },
  },

  // ======================= Side: the First Star (Gammer’s old name)
  {
    id: 'dialogue:oathbound-gammer-star', name: 'The First Star: the star’s old name', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GL, text: 'The little star low over the north field? (She doesn’t even look up.) Oh, that one had a name. My gran called it the Shepherd’s Thumb, because it sits where you’d hold up your thumb to count the sheep against.', next: 'cuthbert' },
      cuthbert: {
        speaker: GL, text: 'The Wheatley girl’s called it what?',
        choices: [
          { text: 'Cuthbert.', to: 'cuthbert2', when: { flag: 'oathbound.star_named', op: '==', value: 'clover' } },
          { text: 'She’s given it a new name. Will it mind?', to: 'mind' },
        ],
      },
      cuthbert2: { speaker: GL, mood: 'happy', text: '(She laughs until the dog barks.) Cuthbert! Oh, that’s better. That’s much better. Tell her it was the Shepherd’s Thumb for six hundred years and it’s been waiting all that time to be called Cuthbert.', next: 'end' },
      mind: { speaker: GL, text: 'Mind? A star? Love, they’ve been called a hundred things by a hundred shepherds. They don’t mind. They’re just glad somebody’s looking.', next: 'end' },
      end: { speaker: GL, text: 'Tell her both names. A star can carry two. Most of us carry more than that.', next: null },
    },
  },

  // ======================= Side: the Recruit and His Shadow (the first night-watch)
  {
    id: 'dialogue:obj-oathbound-dobbin-watchpost', name: 'The Recruit: the first night-watch', scope: 'party',
    entries: [
      { when: { all: [stage('quest:oathbound-the-recruit-and-his-shadow', 'watch'), NIGHT] }, node: 'night' },
      { when: stage('quest:oathbound-the-recruit-and-his-shadow', 'watch'), node: 'day' },
      { node: 'post' },
    ],
    nodes: {
      post: { speaker: 'narrator', text: 'The watch-post on Haybright’s north field, with a lantern hook and a stool, and a sign painted very carefully: NIGHT-WATCH. ASK HERE IF FRIGHTENED.', next: null },
      day: { speaker: 'narrator', text: 'Dobbin is at the post in full daylight, two hours early, polishing the lantern. “It’s not dark yet,” he says. “I’m practising.” Come back after dark.', next: null },
      night: {
        speaker: 'narrator', text: 'Night on the north field, the Dimming lying grey along the edge of the world. Dobbin stands at his post with the lantern held out, very straight. Two village children come up the path, hand in hand, frightened.',
        effects: [{ setFlag: 'oathbound.first_watch', value: true }],
        choices: [
          { text: '(Let Dobbin answer them.)', to: 'dobbin' },
          { text: '(Stand beside him and say nothing.)', to: 'stand' },
        ],
      },
      dobbin: { speaker: 'narrator', text: '“It’s only where the light isn’t,” Dobbin tells them, kneeling, and shows them with the lantern, and makes a rabbit on the barn wall. They go home laughing. Dobbin does not move for a very long time afterwards, in case he cries in front of a knight.', next: null },
      stand: { speaker: 'narrator', text: 'You stand there being a knight. Dobbin does the rest: the lantern, the rabbit, the explaining. When the children have gone he whispers, without looking round, “Did I do it right?” You tell him he did. He did.', next: null },
    },
  },

  // ======================= Side: the Golden Waymarks (your own oath)
  {
    id: 'dialogue:obj-oathbound-new-waymark', name: 'The Golden Waymarks: the blank waymark', scope: 'party',
    entries: [{ when: stage('quest:oathbound-the-golden-waymarks', 'carve'), node: 'stone' }, { node: 'plain' }],
    nodes: {
      stone: {
        speaker: 'narrator', text: 'A new waymark, gilded on the front by Jessamy: LION’S GATE, ONE MILE. The back is smooth grey stone. Every traveller who walks the March from now on will run a hand over whatever you cut there.',
        choices: [
          { text: '(Carve: “I’ll come home.”)', to: 'home', effects: [{ setFlag: 'oathbound.waymark_oath', value: 'home' }] },
          { text: '(Carve: “No one walks this road alone.”)', to: 'alone', effects: [{ setFlag: 'oathbound.waymark_oath', value: 'alone' }] },
          { text: '(Carve: “For the crown that passes. Keep it open.”)', to: 'passes', when: { insight: 'first_oath' }, effects: [{ setFlag: 'oathbound.waymark_oath', value: 'passes' }] },
        ],
      },
      home: { speaker: 'narrator', text: 'I’ll come home. The same as the carter’s, on the first waymark. Half the March has sworn it into these stones. It is a good oath. It is the one most people mean.', next: null },
      alone: { speaker: 'narrator', text: 'No one walks this road alone. You cut it deep, so it will last. Behind you, Jessamy reads it upside down over your shoulder and says nothing, and then says, “Good,” very quietly.', next: null },
      passes: { speaker: 'narrator', text: 'The oldest oath on the March, cut fresh. A thousand years from now somebody will read it and think it was always there. That is rather the idea.', next: null },
      plain: { speaker: 'narrator', text: 'A new gilded waymark on the March road, with an oath on its back.', next: null },
    },
  },

  // ======================= Side: the Bridge Knight (the far bank)
  {
    id: 'dialogue:obj-oathbound-far-bank-door', name: 'The Bridge Knight: the cottage on the far bank', scope: 'party',
    entries: [{ when: stage('quest:oathbound-the-bridge-knight', 'bank'), node: 'door' }, { node: 'plain' }],
    nodes: {
      door: { speaker: 'narrator', text: 'On the far bank of Tench Bridge, a little cottage gone to moss, its door shut. Pinned to it with a rusted nail, under a slate to keep the rain off, a note in a careful hand, very old.', next: 'note' },
      note: {
        speaker: 'narrator', text: '“Humbert. The answer is a promise. When you remember, come over and say it, and I will open the door. — the girl who asked you first.” Below it, in a shakier hand, years later: “Still here.” And below that, shakier still: “Still.”',
        choices: [
          { text: '(Knock.)', to: 'knock' },
          { text: '(Take the note back across to Humbert.)', to: 'take', effects: [{ setFlag: 'oathbound.far_note', value: true }] },
        ],
      },
      knock: { speaker: 'narrator', text: 'Nobody answers. The cottage has been empty a long while. But the step has been swept, and there is a bench by the door facing the bridge, worn smooth by somebody who sat on it every evening for a very long time.', next: 'take' },
      take: { speaker: 'narrator', text: 'You carry the note back across Tench Bridge. When you hand it to him, Humbert reads it, and sits down on his own bridge for the first time in forty years, and does not ask anybody anything for the rest of the day.', next: null },
      plain: { speaker: 'narrator', text: 'A mossy cottage on the far bank of Tench Bridge, with a bench facing the river.', next: null },
    },
  },

  // ======================= Side: the Night Shepherd (the old names for Clover)
  {
    id: 'dialogue:oathbound-clover-names', name: 'The Night Shepherd: the old names for Clover', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: CW, mood: 'happy', text: 'Old names? For the stars? All of them? (She has already fetched a slate.) Go on. Slowly. I can only spell the short ones.', next: 'names' },
      names: {
        speaker: 'narrator', text: 'You give her Gammer Lisle’s names, one by one: the Plough, the Weaver, the Hound, the Shepherd’s Thumb, and low over the March, two hands with a crown between them: the Passing.',
        choices: [
          { text: 'Gammer says you can keep your own names too.', to: 'keep' },
          { text: 'And that one’s the Passing. It never stops moving.', to: 'passing' },
        ],
      },
      keep: { speaker: CW, text: 'Both? A star can have two names? (She writes CUTHBERT next to SHEPERDS THUM, very large.) Good. Then nobody has to lose theirs.', next: null },
      passing: { speaker: CW, text: 'Two hands and a crown. (She draws it on the slate, badly.) Whose hands? Where’s it going? (She looks at you, very serious.) When I’m big I’m going to find out.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds round the Gilded March
  {
    id: 'dialogue:obj-radiance-frontier-ruin-find', name: 'March ruin: the first watch-tower', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A broken watch-tower on a rise, its stairs gone, older than Oathkeep. On the lintel of the empty door, cut deep: WATCH THE DARK FOR THOSE WHO FEAR IT. The Order’s oldest motto, before it was changed to something about the Hierarch.', effects: [{ unlockLore: 'lore:hc-radiance-frontier-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-radiance-frontier-cave-find', name: 'March cave: the oath-cave', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'Deep in the cave, where the Dimming never reached because it has always been dark, the walls are covered in oaths scratched by candlelight: lovers, soldiers, children, a hundred years of them. The newest, near the entrance, is very small and very neat: I SHALL COME BACK FOR YOU. B.', effects: [{ unlockLore: 'lore:hc-radiance-frontier-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-radiance-frontier-cave-codex', name: 'March cave: a squire’s tally', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A slate wedged in a crack, scratched over in two hands. A tally of stars, one column each: one stops at four thousand and eleven, the other goes on past six thousand. At the bottom, in the faster hand: “Told you. Your turn to carry the lantern home. I.”', effects: [{ unlockLore: 'lore:hc-radiance-frontier-tally' }], next: null } },
  },
  {
    id: 'dialogue:obj-radiance-frontier-view-find', name: 'March viewpoint: Sunset Rise', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'From the Rise the whole of the Gilded March lies gold to the west and grey to the east, and the line where the Dimming begins runs straight across the land like the edge of a blanket. Somebody has set a bench here facing east, towards the dark, not the light.', effects: [{ unlockLore: 'lore:hc-radiance-frontier-view' }], next: null } },
  },

  // ======================= ACT II (wave 2 depth): C-1 The Shorewatch, the watch-rota
  {
    id: 'dialogue:obj-oathbound-shorewatch-rota', name: 'C-1 the Shorewatch watch-rota', scope: 'party',
    entries: [{ when: stage('quest:oathbound-abbeyshore', 'rota'), node: 'rota' }, { node: 'plain' }],
    nodes: {
      rota: { speaker: 'narrator', text: 'Nailed to the Shorewatch post, swollen with thirty years of lake air: the watch-rota, a column for every day since C. 1012 and three names in every column. CUTHBERT: WATCH. BRYONY: WATCH. PETRONELLA: WATCH. Nobody has ever had a day off. Nobody has ever been down for night.', next: 'cuth' },
      cuth: {
        speaker: CL, text: 'Ten thousand nine hundred and something days, and not a gap in it. (He taps the post; rust falls off.) There’s a space at the bottom, see. For relief. We keep it ruled, in case.',
        choices: [
          { text: '(Write your name in the relief space.)', to: 'name', effects: [{ setFlag: 'oathbound.rota', value: 'named' }] },
          { text: 'You never once took a night off?', to: 'night', effects: [{ setFlag: 'oathbound.rota', value: 'asked' }] },
          { text: '(Write “STOOD DOWN: ONE DAY” under all three names.)', to: 'leave', effects: [{ setFlag: 'oathbound.rota', value: 'leave' }] },
        ],
      },
      name: { speaker: CL, mood: 'happy', text: 'Relief! In ink! (He reads it four times.) Not yet, mind. You’re not relieving us yet; that isn’t how a rota works. But it’s there, and that is a great comfort to an old knight with wet feet.', next: null },
      night: { speaker: CL, text: 'Night? We’d have had to agree who took it. Bryony wanted it, Petronella can’t hear the wake-up, and I don’t trust either of them. So all three of us stood day, all night. It seemed fairest.', next: 'bry' },
      bry: { speaker: 'npc:bryony-wade', text: '(From the shallows.) I’d have been brilliant at night. Things come out at night. You can fight them.', next: null },
      leave: { speaker: 'npc:bryony-wade', text: '(Ser Bryony reads it over your shoulder.) One day off. In thirty years. (She considers it seriously.) I’d spend it fighting someone.', next: null },
      plain: { speaker: 'narrator', text: 'The Shorewatch watch-rota, three names to a column, going back thirty years.', next: null },
    },
  },

  // ======================= ACT II, C-2 The Shorewatch Oath: Petronella at the oars
  {
    id: 'dialogue:oathbound-petronella-row', name: 'C-2 Petronella rows on', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Halfway out over the drowned Abbey the water starts to sing: forty voices, very far down, a hymn of the hours with the rests taken out. Ser Cuthbert’s oar stops. Ser Bryony’s oar stops. Both of them are smiling gently, asleep.', next: 'rows' },
      rows: { speaker: 'narrator', mood: 'happy', text: 'Ser Petronella rows on, steady as a mill-wheel, humming something else entirely and slightly flat.', next: 'pet' },
      pet: {
        speaker: 'npc:petronella-fane', text: 'WHAT’S THAT, DEAR? Singing? Can’t hear a thing. Haven’t since C. 1015. (Another stroke.) Is it pretty? Cuthbert always says it’s pretty, and then he nods off, and I row us home.',
        choices: [
          { text: 'You’ve done this before.', to: 'before' },
          { text: '(Sing over the choir, loud enough to keep yourself awake.)', to: 'sing', school: 'radiance' },
          { text: '(Nod, and point down.)', to: 'down' },
        ],
      },
      before: { speaker: 'npc:petronella-fane', text: 'Every time somebody tried to swim out, dear. Seven times. Somebody had to fetch them back, and I was the only one the choir couldn’t get at. (Proudly.) Deafness. Very underrated in a knight.', next: 'down' },
      sing: { speaker: 'narrator', mood: 'happy', text: 'You sing the March hymn over the choir, loud and not very well. Petronella can’t hear it, but she sees your mouth going and joins in with a different hymn altogether, and between the two of you nobody nods off.', next: 'down' },
      down: { speaker: 'npc:petronella-fane', text: '(She ships her oar and peers over the side.) There’s your door, dear. North door, standing open. Cuthbert would want me to say something knightly. (She thinks about it.) Mind the step.', effects: [{ setFlag: 'oathbound.rowed', value: true }], next: null },
    },
  },

  // ======================= ACT II, C-3 Abbess Morwen: the report to Cuthbert
  {
    id: 'dialogue:oathbound-cuthbert-report', name: 'C-3 reporting to the Shorewatch', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The Shorewatch are sitting on the shore in a row, as they have done since they stopped standing. All three get up when they see you coming, which takes a while.', next: 'c1' },
      c1: {
        speaker: CL, text: 'Report, Oathbound. We heard the singing stop. Bryony thought you’d drowned. Petronella didn’t hear anything, so she thought we were being dramatic.',
        choices: [
          { text: 'She asked me to release her from her oath. I did.', to: 'released', when: { flag: 'oathbound.morwen', op: '==', value: 'released' } },
          { text: 'She asked me to release her. I asked her to keep it a little longer.', to: 'kept', when: { flag: 'oathbound.morwen', op: '==', value: 'kept' } },
          { text: 'The Abbess is at rest. Her choir is asleep.', to: 'rest' },
        ],
      },
      released: { speaker: CL, mood: 'sad', text: 'Released. A thousand years, and somebody finally came down and said the words. (He takes off his helm, which he has never done in front of you.) We kept people from her for thirty of them. I’d like to think that was part of it.', next: 'part' },
      kept: { speaker: CL, text: 'A little longer, until a true Turning. (He nods slowly.) That’s a proper oath, that is. You don’t lay it down; you hand it over at the right time. I wish somebody had told us that in C. 1012.', next: 'part' },
      rest: { speaker: CL, mood: 'sad', text: 'At rest. (He looks out at the flat grey water.) Thirty years we kept everyone away from her, and all that time what she wanted was for somebody to come down.', next: 'part' },
      part: {
        speaker: CL, text: 'Well. That’s the nave seen to.',
        choices: [
          { text: 'You kept your oath, Ser. Every day of it.', to: 'oath', trust: 1 },
          { text: 'What will the Shorewatch do now?', to: 'now' },
        ],
      },
      oath: { speaker: CL, mood: 'happy', text: '(He stands up straighter, and a shower of rust comes off his pauldrons.) We did, didn’t we. Bryony! We kept it! (Ser Bryony says something rude, happily.)', next: 'now' },
      now: { speaker: CL, text: 'Petronella wants to go home to the March. Bryony wants to fight something. I want dry socks. (A pause.) And there’s word from Brindlecross: Old Hobb’s graves are emptying, in step, like a muster. That sounds like a knight’s business. That sounds like yours.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Dame’s Muster: the second and third graves
  beat('oathbound-oath-grave-2', 'C-4 the second sworn grave', stage('quest:oathbound-the-dames-muster', 'graves'),
    'A second empty grave, a Brindlecross watchman’s, by the wall. The ring pressed into its soil is not his: it is an Oathkeep ring, sun turned inward, and the words scratched beside it are the same as before. “Sworn. To the crown, and to whoever wears it.”',
    'oathbound.grave_2', 'An empty grave by the wall, with a small round print in the soil.'),
  beat('oathbound-oath-grave-3', 'C-4 the third sworn grave', stage('quest:oathbound-the-dames-muster', 'graves'),
    'The third grave has two rings pressed into it, side by side. One is turned inward, like the others. The other is turned outward, sun to the sky, and pushed in hard, as if whoever left it had been arguing with herself and lost.',
    'oathbound.grave_3', 'An empty grave with two small round prints in the soil.',
    'Scratched beneath the outward ring, and then scratched out, though not well enough: “Bea would have stopped me at the third.”'),

  // ======================= ACT II, C-5 Bonelord Varric: Ilsabet’s candle at the throne
  beat('oathbound-ilsabet-candle', 'C-5 Ilsabet’s candle at Varric’s throne', stage('quest:oathbound-bonelord-varric', 'candle'),
    'At the foot of Varric’s throne of shields a candle has burned down to a puddle of wax, and beside it lies a page in Ilsabet’s round, courteous hand: the muster she swore, name by name, three hundred and twelve of them, each ticked, each with “sworn” beside it in the same steady ink.',
    'oathbound.ilsabet_page', 'A puddle of old candle-wax at the foot of a throne of shields.',
    'At the very bottom, one more name, in the same hand but not steady at all: Beatrix Holm. There is no tick beside it. Only, very small: “Not her. Not ever. Wait for her at the stair.”'),

  // ======================= ACT II, C-6 Hamish Delivers: the lane, the Goose, the answer
  {
    id: 'dialogue:area-oathbound-goose-lane', name: 'C-6 banter: Hamish on the way to the Goose', bark: true,
    entries: [{ when: { any: [stage('quest:oathbound-hamish-delivers', 'escort'), stage('quest:oathbound-hamish-delivers', 'regroup')] }, node: 'b' }],
    nodes: { b: { speaker: 'npc:hamish-at-the-gate', text: 'I swear I’ll stop leaning on you in a minute. (He squints ahead.) Is that the inn? There’s a goose on the sign. I swear that’s a goose. I’ve never been so glad to see a goose.', next: null } },
  },
  {
    id: 'dialogue:oathbound-hamish-goose', name: 'C-6 Hamish takes an answer home', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Hamish is at the best table in the Gilded Goose, by the fire, with a bowl of stew, a fresh bandage round his head and a pencil behind his ear. The potboy has put a cushion on the bench for him without being asked.', next: 'tavern' },
      tavern: { speaker: HG, mood: 'happy', text: 'There IS a tavern. I swore I’d find out, and there is, and it does stew. That’s two hundred and ten. And I swore I’d carry your answer back to the Marshal, so that’s two hundred and eleven, and I can’t keep that one till you’ve said it.', next: 'ask' },
      ask: {
        speaker: HG, text: 'She’ll want it short. She says long letters are for people with nothing to do. What shall I tell her?',
        choices: [
          { text: '“Kept it. Minding her. Coming home.”', to: 'sent', effects: [{ setFlag: 'oathbound.reply', value: 'kept' }] },
          { text: '“I found Ilsabet’s page. She’s waiting for you at the stair. So am I.”', to: 'sent', when: { flag: 'oathbound.ilsabet_page' }, effects: [{ setFlag: 'oathbound.reply', value: 'stair' }] },
          { text: '“Hamish fell down the whole Dawn Gate and still delivered. Promote him.”', to: 'promote', effects: [{ setFlag: 'oathbound.reply', value: 'hamish' }] },
        ],
      },
      promote: { speaker: HG, text: '(He goes very red.) I can’t carry that. I’d have to swear it was true. (A pause.) It is true, though, isn’t it. All right. But I’m saying it very fast.', next: 'sent' },
      sent: { speaker: HG, text: '(He writes it on the back of one hand, then on the other, in case.) Got it. I swear I’ll carry it home or die trying. (He considers this.) I’d rather not die trying. I’ll go carefully. I’ll go after pudding.', next: 'end' },
      end: { speaker: 'narrator', mood: 'happy', text: 'Two hundred and eleven oaths, every one of them kept or keeping. Squire Hamish Goodbody falls asleep at the best table in the Gilded Goose with his face very nearly in his pudding, smiling.', next: null },
    },
  },

  // ======================= ACT III, A Promise Kept Late: the grey, and the road home
  {
    id: 'dialogue:obj-oathbound-ilsabet-grey', name: 'A Promise Kept Late: the grey horse', scope: 'party',
    entries: [{ when: stage('quest:oathbound-a-promise-kept-late', 'grey'), node: 'grey' }, { node: 'plain' }],
    nodes: {
      grey: { speaker: 'narrator', text: 'Among the hollow horses of the Legion stands a grey in March harness, saddled for a long ride and patiently not eating. Its saddle-roll is buckled the Oathkeep way, square and tight, and has not been undone in thirty years.', next: 'roll' },
      roll: {
        speaker: 'narrator', text: 'Inside the roll, folded flat: two tin cups, two plates, two spoons, and a blanket wide enough for two to sit on at a Turning feast. Ilsabet packed for the ride she and Beatrix promised each other. She never unpacked the second cup.',
        choices: [
          { text: '(Buckle it up again, square and tight.)', to: 'buckle' },
          { text: '(Take the second cup, and carry it yourself.)', to: 'cup', effects: [{ setFlag: 'oathbound.second_cup', value: true }] },
        ],
      },
      buckle: { speaker: 'narrator', text: 'You buckle the roll up again the Oathkeep way. The grey turns its head and looks at you, as horses do when somebody finally does a thing properly, and lets you lead it out of the Legion.', next: null },
      cup: { speaker: 'narrator', text: 'You put the second cup in your pack. Somebody ought to carry it the rest of the way. The grey lets you lead it out of the Legion, unhurried, like a horse that knows exactly where it is going.', next: null },
      plain: { speaker: 'narrator', text: 'A patch of trodden ground in the Legion camp, where a horse stood for a long time.', next: null },
    },
  },
  {
    id: 'dialogue:obj-oathbound-grey-road', name: 'A Promise Kept Late: the road home', scope: 'party',
    entries: [
      { when: { all: [stage('quest:oathbound-a-promise-kept-late', 'ride'), { flag: 'oathbound.nemesis_fate', op: '==', value: 'spared' }] }, node: 'spared' },
      { when: stage('quest:oathbound-a-promise-kept-late', 'ride'), node: 'alone' },
      { node: 'plain' },
    ],
    nodes: {
      spared: { speaker: 'narrator', text: 'At the edge of the Heart camp, where the road home begins, Ilsabet is waiting with her helm under her arm. She takes the grey’s bridle from you and stands a while with her forehead against its neck.', next: 'ils' },
      ils: {
        speaker: IL, text: 'Bea promised to ride with me to the Turning. She stayed; I went. (She mounts, stiffly.) Ride a little way with me, Oathbound? Only to the first bend. Somebody should keep her half of it.',
        choices: [
          { text: '(Ride beside her to the first bend.)', to: 'bend', effects: [{ setFlag: 'oathbound.grey_home', value: 'ridden' }] },
          { text: '(Give her the second cup first.)', to: 'cup', when: { flag: 'oathbound.second_cup' }, effects: [{ setFlag: 'oathbound.grey_home', value: 'cup' }] },
        ],
      },
      cup: { speaker: IL, mood: 'happy', text: '(She turns the tin cup over in her hand.) I packed that for her. (She laughs, and this time it doesn’t break.) I’ll give it her myself, and make her drink something out of it, and she’ll complain. Thirty years. Thank you.', next: 'bend' },
      bend: { speaker: 'narrator', text: 'You ride beside her to the first bend of the road, at a walk, neither first nor second. At the bend she raises one gauntlet to you, politely, and rides on alone towards the March, and Bea.', next: null },
      alone: { speaker: 'narrator', text: 'At the edge of the Heart camp, where the road home begins, you tie an Oathkeep ribbon to the grey’s saddle: ILSABET. C. 1012. GONE TO THE TURNING. Underneath, in your own hand, you add two words: COME HOME.', next: 'go' },
      go: { speaker: 'narrator', mood: 'sad', text: 'Then you turn the grey’s head to the road and let the reins go. It goes at a walk, the way she rode, without looking back: south, towards the Dawn Gate and the March and Beatrix Holm, who promised to ride with it once.', effects: [{ setFlag: 'oathbound.grey_home', value: 'riderless' }], next: null },
      plain: { speaker: 'narrator', text: 'The edge of the Heart camp, where the road home begins. Hoofprints, going south, at a walk.', next: null },
    },
  },

  // ======================= ACT III, The Sorrow-Sworn: the ribbons, and a new oath
  {
    id: 'dialogue:obj-oathbound-sworn-swords', name: 'The Sorrow-Sworn: the ribbons', scope: 'party',
    entries: [{ when: stage('quest:oathbound-the-sorrow-sworn', 'swords'), node: 'swords' }, { node: 'plain' }],
    nodes: {
      swords: { speaker: 'narrator', text: 'The Sorrow-Sworn have stacked their swords by the Heart camp’s fire, point down, the way it is done in the Hall at Oathkeep. Each has its ribbon. The knights sit round them in a ring and look at them as if they belonged to strangers.', next: 'read' },
      read: { speaker: 'narrator', text: 'You read the ribbons aloud, one by one. Old dates, mostly, C. 1013, C. 1015: knights who heard what Ilsabet swore and swore it after her. Every time you say a name, somebody in the ring looks up.', next: 'young' },
      young: {
        speaker: 'narrator', text: 'The last ribbon is new, the silk still bright: A. RUDD. HAYBRIGHT. C. 1040. Sworn at sixteen to a crown she had never seen, for a knight she knew only from a song.',
        choices: [
          { text: '(Find A. Rudd, and give her back her sword, hilt first.)', to: 'hilt', effects: [{ setFlag: 'oathbound.sworn_names', value: 'rudd' }] },
          { text: '(Read the whole list again, slower, until everyone has looked up.)', to: 'again', effects: [{ setFlag: 'oathbound.sworn_names', value: 'all' }] },
        ],
      },
      hilt: { speaker: 'narrator', mood: 'happy', text: 'A girl with a Haybright accent and a March sunburn takes it from you in both hands. “Avice,” she says. “My name’s Avice.” And then, appalled: “My mum is going to kill me.”', next: null },
      again: { speaker: 'narrator', text: 'You read the list again, slower. By the end every knight in the ring has looked up, and one or two are saying their own names under their breath, trying them on, like boots left out in the rain.', next: null },
      plain: { speaker: 'narrator', text: 'A stack of March swords by the Heart camp fire, each with its ribbon.', next: null },
    },
  },
  {
    id: 'dialogue:obj-oathbound-sworn-vigil', name: 'The Sorrow-Sworn: a new oath', scope: 'party',
    entries: [{ when: stage('quest:oathbound-the-sorrow-sworn', 'vigil'), node: 'file' }, { node: 'plain' }],
    nodes: {
      file: { speaker: 'narrator', text: 'The Sorrow-Sworn have formed up in file at the head of the Radiance stair, empty-handed, because a knight without an oath does not know what to do with her hands.', next: 'ask' },
      ask: {
        speaker: 'narrator', text: 'They are waiting for you to give them something to swear.',
        choices: [
          { text: '“Swear to the March. Village by village.”', to: 'march', effects: [{ setFlag: 'oathbound.sworn_oath', value: 'march' }] },
          { text: '“Swear to the crown that passes, and pass it on.”', to: 'passes', when: { insight: 'first_oath' }, effects: [{ setFlag: 'oathbound.sworn_oath', value: 'passes' }] },
          { text: '“Swear whatever you like, until it is someone else’s turn.”', to: 'turn', effects: [{ setFlag: 'oathbound.sworn_oath', value: 'turn' }] },
          { text: '“Swear nothing at all, for a year. Then see.”', to: 'nothing', effects: [{ setFlag: 'oathbound.sworn_oath', value: 'nothing' }] },
        ],
      },
      march: { speaker: 'narrator', text: 'They swear it in file, the Order’s oldest way, nobody first and nobody last: to the March, village by village, no village alone. It sounds like something a person could keep.', next: 'home' },
      passes: { speaker: 'narrator', text: 'To the crown that passes. They say it slowly, and you watch them understand it the way Ilsabet did: not an oath to hold on to, but an oath to hand on. Their fists open on the last word.', next: 'home' },
      turn: { speaker: 'narrator', text: '“Until it is someone else’s turn.” It is a strange way to end an oath. They say it twice to be sure of it, and it does not get any heavier the second time.', next: 'home' },
      nothing: { speaker: 'narrator', mood: 'happy', text: 'There is an appalled silence. Then the oldest of them begins to laugh, and cannot stop, and says that in fifty years of knighthood it is the first order she has ever wanted to obey.', next: 'home' },
      home: { speaker: 'narrator', text: 'Then they go down the Twelve Stairs in file, and somewhere near the bottom they stop being a file and are only knights, walking home.', next: null },
      plain: { speaker: 'narrator', text: 'The head of the Radiance stair, with a ring of bootprints where a file of knights stood.', next: null },
    },
  },

  // ======================= ACT III, Ser Gallant’s Rest: the squire in the dark, and the farewell
  {
    id: 'dialogue:obj-oathbound-squired-kit', name: 'Ser Gallant’s Rest: who keeps your kit', scope: 'party',
    entries: [
      { when: { all: [stage('quest:oathbound-ser-gallants-rest', 'kit'), { flag: 'oathbound.gallant', op: '==', value: 'held' }] }, node: 'held' },
      { when: stage('quest:oathbound-ser-gallants-rest', 'kit'), node: 'sword' },
      { node: 'plain' },
    ],
    nodes: {
      held: { speaker: 'narrator', text: 'You lie awake to see who it is. In the small hours a figure comes out of the dark in armour that somehow does not clank, kneels by your kit, and begins to oil your shield-straps, slowly, with great care. It is Ser Gallant.', next: 'held2' },
      held2: {
        speaker: 'npc:ser-gallant', text: '(He doesn’t stop.) A squire keeps his knight’s kit. I was a squire once, and I broke my oath to my knight. I thought, if I kept yours, it might count for something. Go back to sleep, Oathbound.',
        choices: [
          { text: 'It counts, Ser Gallant.', to: 'counts', effects: [{ setFlag: 'oathbound.gallant_squired', value: true }] },
          { text: '(Go back to sleep, and let him finish.)', to: 'sleep', effects: [{ setFlag: 'oathbound.gallant_squired', value: true }] },
        ],
      },
      counts: { speaker: 'npc:ser-gallant', mood: 'sad', text: 'Not yet. Not till her name’s been said at the stair. (He looks towards the Legion camp.) Soon, I think. I can feel it, like a rattle in a scabbard.', next: null },
      sleep: { speaker: 'narrator', text: 'You let him finish. In the morning your shield-straps are supple as gloves and your boots are blacked, and at the edge of the Legion camp somebody is sitting on a broken cart, waiting.', next: null },
      sword: { speaker: 'narrator', text: 'You lie awake to see who it is. In the small hours something comes rattling across the camp on its own: Ser Gallant’s sword in its rusted scabbard. It lays itself across your kit like a squire’s blade across a doorway, and keeps watch.', next: 'sword2' },
      sword2: { speaker: 'narrator', mood: 'sad', text: 'Before dawn it rattles away again, towards the Legion camp, as if it had somewhere else to be. You released him in the Chapel. He owed you nothing. It kept watch anyway.', effects: [{ setFlag: 'oathbound.gallant_squired', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Your kit at the Heart camp, set very straight.', next: null },
    },
  },
  {
    id: 'dialogue:obj-oathbound-gallant-farewell', name: 'Ser Gallant’s Rest: a knight’s farewell', scope: 'party',
    entries: [
      { when: { all: [stage('quest:oathbound-ser-gallants-rest', 'farewell'), { flag: 'oathbound.gallant', op: '==', value: 'held' }] }, node: 'helm' },
      { when: stage('quest:oathbound-ser-gallants-rest', 'farewell'), node: 'blade' },
      { node: 'plain' },
    ],
    nodes: {
      helm: { speaker: 'narrator', text: 'You carry Ser Gallant’s helm up the Twelve Stairs and set it at the head of the Radiance stair, facing the way his lady faced. A knight’s farewell is short: his name, his lord’s name, and what he kept.', next: 'say' },
      blade: { speaker: 'narrator', text: 'You carry Ser Gallant’s sword up the Twelve Stairs, quiet now in its scabbard, and lay it at the head of the Radiance stair where his lady stood. A knight’s farewell is short: his name, his lord’s name, and what he kept.', next: 'say' },
      say: {
        speaker: 'narrator', text: 'What did he keep?',
        choices: [
          { text: '“Ser Gallant, squire to Dame Ilsabet. He kept faith, late.”', to: 'late', effects: [{ setFlag: 'oathbound.gallant_farewell', value: 'late' }] },
          { text: '“Ser Gallant the Forsworn, who got up every time he fell.”', to: 'fell', effects: [{ setFlag: 'oathbound.gallant_farewell', value: 'fell' }] },
          { text: '(Say nothing. Kneel, the Oathkeep way, until the stair is quiet.)', to: 'kneel', school: 'radiance', effects: [{ setFlag: 'oathbound.gallant_farewell', value: 'kneel' }] },
        ],
      },
      late: { speaker: 'narrator', text: 'You say it. It is the first time in thirty years that anybody has said his name without “the Forsworn” after it. The stair is very quiet.', next: null },
      fell: { speaker: 'narrator', mood: 'happy', text: 'You say it. Somewhere down in the Legion camp a cart creaks, as if something lying on it had sat up to listen, and then lain down again, satisfied.', next: null },
      kneel: { speaker: 'narrator', text: 'You kneel until the stair is quiet, the way a knight keeps vigil for a knight. When you stand up your knees crack like Cuthbert’s, and nothing else on the stair moves at all.', next: null },
      plain: { speaker: 'narrator', text: 'Something of Ser Gallant’s, set down very straight at the head of the Radiance stair.', next: null },
    },
  },
];

export default dialogues;
