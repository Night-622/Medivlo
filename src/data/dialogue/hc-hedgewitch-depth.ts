/**
 * Hollow Crown, HEDGEWITCH Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const YA = 'npc:mother-yarrow' as const, OS = 'npc:ostara' as const, CR = 'npc:cicely-rue' as const, CA = 'npc:campion' as const;
const TW = 'npc:thaddeus-wort' as const, HM = 'npc:hepzibah-marl' as const, FC = 'npc:fennimore-clay' as const;
const DT = 'npc:dunstan-treacle' as const, GB = 'npc:gran-burdock' as const, HS = 'npc:hester-mudlark' as const;
const ND = 'npc:ned-burdock' as const;
const VOTE: Q = 'quest:hedgewitch-the-ring-vote';
const TG = 'npc:teasel-gammon' as const, JW = 'npc:jennet-wadeley' as const;
const C1: Q = 'quest:hedgewitch-thornhollow', C2: Q = 'quest:hedgewitch-the-willows-roots', C5: Q = 'quest:hedgewitch-the-ooze-sovereign';
const C6: Q = 'quest:hedgewitch-a-letter-from-yarrow', ACORN: Q = 'quest:hedgewitch-yarrows-acorn', GRAN: Q = 'quest:hedgewitch-gran-burdocks-rest';
const THISTLE: Q = 'quest:hedgewitch-thistledowns-answer';

/** a clue object: one scene while its stage runs (sets its flag), a plain line otherwise */
function clue(id: string, name: string, when: NarrativeCondition, text: string, flag: string, plain: string, more?: string): DialogueDef {
  return {
    id: `dialogue:obj-${id}`, name, scope: 'party',
    entries: [{ when, node: 'clue' }, { node: 'plain' }],
    nodes: {
      clue: { speaker: 'narrator', text, effects: [{ setFlag: flag, value: true }], next: more ? 'more' : null },
      ...(more ? { more: { speaker: 'narrator', text: more, next: null } } : {}),
      plain: { speaker: 'narrator', text: plain, next: null },
    },
  };
}
/** a one-node find (optional areas, lair side rooms) that unlocks a codex entry */
const find = (id: string, name: string, text: string, lore: `lore:${string}`): DialogueDef => ({
  id: `dialogue:obj-${id}`, name, scope: 'party',
  entries: [{ node: 'find' }],
  nodes: { find: { speaker: 'narrator', text, effects: [{ unlockLore: lore }], next: null } },
});

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Bell in the Boughs: the bough-road, the Hushing Bough
  {
    id: 'dialogue:area-hedgewitch-bough-road', name: 'I-1 banter: the bough-road at night', bark: true,
    entries: [{ when: stage('quest:hedgewitch-the-bell-in-the-boughs', 'trunk'), node: 'b' }],
    nodes: { b: { speaker: YA, text: 'Left at the cheese stall, over the rope, under the washing. No, that washing. Evening, Mistress Coddle! Yes, I know. I’m having a word with it now.', next: null } },
  },
  {
    id: 'dialogue:hedgewitch-yarrow-hush', name: 'I-1 the Hushing Bough', scope: 'party',
    entries: [{ node: 'bark' }],
    nodes: {
      bark: { speaker: 'narrator', text: 'The Hushing Bough, where the market meets the trunk. The bark here is worn smooth and dark by hands: six hundred years of witches have stood on this spot and talked the tree down from its moods. Tonight it is warm to the touch, and trembling, like a horse after a fright.', next: 'hands' },
      hands: { speaker: YA, text: '(She puts both palms flat on the bark.) There now. There. You grew a ring in one breath and dropped the rope bridge in the river and frightened Mistress Coddle’s cats. I’m not cross. I’m not. I’d just like to know why.', next: 'ask' },
      ask: {
        speaker: YA, text: 'It won’t tell me, of course. It never does. But it might tell you, dear. You’ve got its song in you. Put your ear to it. Go on. It doesn’t bite. Well. Not often.',
        choices: [
          { text: '(Put your ear to the bark and listen.)', to: 'listen' },
          { text: '[Verdant] (Hum back the song in your chest, very softly, into the wood.)', to: 'hum', school: 'verdant' },
          { text: 'What if it doesn’t like what I hear?', to: 'like' },
        ],
      },
      like: { speaker: YA, mood: 'happy', text: 'Then you’ll be the first person in Rootholme to find out what it thinks, and you can tell the Circle, and they can disagree with it. Ear to the bark, dear.', next: 'listen' },
      listen: { speaker: 'narrator', text: 'Sap, moving. A long way down, slow as a sleeper’s breath, something beats. And under the beat, so faint you could miss it, your own song, coming back up through the wood to meet you. Something deep in the tree is singing your note.', next: 'deep' },
      hum: { speaker: 'narrator', text: 'You hum. For a moment nothing. Then the whole bough hums with you, a low green note that you feel in your teeth, and every leaf for fifty paces turns over, silver side up, and back again. Somewhere deep in the tree, something is singing your note.', next: 'deep' },
      deep: {
        speaker: YA, mood: 'afraid', text: '(She has gone quite still.) That’s from the Heartwood. Right down in the middle of it, where nobody goes. Oh, my word. It’s been down there thirty years, singing to nobody, and nobody heard it but the tree.',
        choices: [
          { text: 'It’s the Heartwood half. It’s calling me down.', to: 'down' },
          { text: 'Is that why it can’t stop growing?', to: 'grow', insight: 'hedgewitch_growing_song' },
        ],
      },
      grow: { speaker: YA, mood: 'sad', text: 'Maybe. A song with nobody to sing it to. I’d grow too, I think, if I’d been talking to myself for thirty years. (She pats the bark.) Not that I’d know anything about that.', next: 'down' },
      down: { speaker: YA, text: 'Not tonight. Nobody goes into the Heartwood in their nightshirt. Tonight we tidy up after this great baby and get some sleep, and tomorrow you can have my second-best shears and make yourself useful on the Markets.', next: 'shears' },
      shears: {
        speaker: YA, text: '(She turns back to the tree.) And you. Hush now. Nobody’s cross. We’re going to find out what’s wrong, the young one and me. Say goodnight, dear.',
        choices: [
          { text: 'Goodnight, tree.', to: 'night', trust: 1 },
          { text: '(Lay your palm on the bark, the way she does.)', to: 'palm' },
        ],
      },
      night: { speaker: YA, mood: 'happy', text: 'There. Feel that? The leaves have gone soft. Bed, now, and no reading under the blanket. I can always tell. The tree tells me. (It doesn’t. She can.)', next: null },
      palm: { speaker: 'narrator', text: 'Under your hand the trembling slows, and stops, and the bark is only warm. Yarrow watches you with an odd look on her face, as if she has just seen somebody do a thing she has been trying to do for sixty years. Then she sends you to bed.', next: null },
    },
  },

  // ======================= I-2 Pruning Day: what Lantern Row swallowed
  clue('hedgewitch-lantern-clue-1', 'I-2 Lantern Row (1)', stage('quest:hedgewitch-pruning-day', 'row'),
    'A lantern, still lit, inside the bark. The tree has grown round it like a hand round a candle, and it glows through the wood amber and warm. Somebody’s lantern, on somebody’s hook, by somebody’s door. The street is in there, whole.', 'hedgewitch.row_1',
    'A lantern’s glow under smooth new bark.'),
  clue('hedgewitch-lantern-clue-2', 'I-2 Lantern Row (2)', stage('quest:hedgewitch-pruning-day', 'row'),
    'A brass door-knocker sticking out of the bark at knee height, shaped like a fox. You knock, because you cannot help it. From somewhere inside the wood a cat answers, furious, and then a second cat, and then what sounds like all of them.', 'hedgewitch.row_2',
    'A brass fox knocker, half swallowed by the bark.'),
  clue('hedgewitch-lantern-clue-3', 'I-2 Lantern Row (3)', stage('quest:hedgewitch-pruning-day', 'row'),
    'At the bottom of the new bark, where it meets the old, a vein of black runs down into the trunk, thin as a hair and shining. It is not on the surface. It is in the wood, feeding it. It runs down, and down, towards the Sap Wells.', 'hedgewitch.sap_vein',
    'New bark where Lantern Row used to be.', 'The new growth over the Row is fattest along the black vein, as if that is what it is drinking.'),

  // ======================= I-4 The Bramblewife’s Garden: the sap-stair, the Deep Well
  {
    id: 'dialogue:area-hedgewitch-sap-stair', name: 'I-4 banter: down the sap-stair', bark: true,
    entries: [{ when: stage('quest:hedgewitch-the-bramblewifes-garden', 'well'), node: 'b' }],
    nodes: { b: { speaker: OS, text: '(Her voice comes up the stair ahead of you, cheerful.) Mind step forty, love, it’s sticky. Mind forty-one, it’s stickier. Mind all of them, really. I do.', next: null } },
  },
  {
    id: 'dialogue:hedgewitch-ostara-well', name: 'I-4 the Deep Well with Ostara', scope: 'party',
    entries: [{ node: 'well' }],
    nodes: {
      well: { speaker: 'narrator', text: 'The Deep Well is a shaft cut straight down into the heartwood, wide as a room, ringed with tappers’ ledges. The air is warm and sweet enough to taste. Far below, sap glints like honey in a jar. Ostara is letting down a bucket on a rope.', next: 'heart' },
      heart: { speaker: OS, mood: 'happy', text: 'There. Smell that. That’s the heart of the tree, that is, coming up to say good morning. Every spoonful I give comes out of here. Hold the rope, love, it pulls.', next: 'rope' },
      rope: {
        speaker: 'narrator', text: 'It does pull. The rope hums in your hands, and the bucket comes up full and heavy and warm. The sap in it is gold, mostly. Swirling through the gold, slow as smoke, is a thread of black.',
        choices: [
          { text: 'Ostara, there’s black in it.', to: 'black' },
          { text: 'There was a black vein under Lantern Row. It ran down here.', to: 'vein', when: { flag: 'hedgewitch.sap_vein' }, effects: [{ setFlag: 'hedgewitch.well_black', value: true }] },
          { text: '(Say nothing. Watch what she does with it.)', to: 'watch', effects: [{ setFlag: 'hedgewitch.well_black', value: true }] },
        ],
      },
      black: { speaker: OS, text: 'Is there? (She looks into the bucket, and smiles, and stirs it with her finger until the black is gone into the gold.) Heart’s blood, love. Strong stuff, from deep down. It’s what makes it work.', next: 'mother' },
      vein: { speaker: OS, text: '(Her finger stops stirring, just for a moment.) Did it? Clever witch. Clever eyes. The tree’s a big place, love, and things run all over it. (She stirs the black away into the gold.) Heart’s blood. It’s what makes it work.', next: 'mother' },
      watch: { speaker: 'narrator', text: 'She tips the bucket into her own pail without looking at it, and stirs it once with a finger, and the black is gone into the gold. Then she licks the finger, thoughtfully, like a cook.', next: 'mother' },
      mother: {
        speaker: OS, mood: 'sad', text: 'My mother brought me down here, when I was small. She was a tapper. She said the Deep Well was the only place in Rootholme you could hear the tree’s heart. Then she took a fever, and the Circle sang her into the compost, and I came down here on my own and listened.',
        choices: [
          { text: 'What did you hear?', to: 'hear' },
          { text: 'I’m sorry, Ostara.', to: 'sorry', trust: 1, trustNpc: OS },
        ],
      },
      hear: { speaker: OS, text: 'Nothing, love. It was beating, and it didn’t care. It beat the same the day she went as the day before. I decided then that somebody in Rootholme ought to care. Somebody ought to keep people.', next: 'up' },
      sorry: { speaker: OS, mood: 'happy', text: 'Bless you. Don’t be. I was nine and furious, and I married a bramble patch to show them. Then I learned to heal. Being furious is no good to anybody unless you can do something with it.', next: 'up' },
      up: { speaker: OS, mood: 'happy', text: 'Right. Two buckets, and up we go, and then tea. You carry that one. Don’t spill it. It’s worth more than you are, love, no offence. (It is a joke. You are almost sure it is a joke.)', next: null },
    },
  },

  // ======================= I-5 The Ring Vote: canvassing, and dawn on Cobble Lane
  {
    id: 'dialogue:hedgewitch-cicely-canvass', name: 'I-5 Eldest Cicely Rue on the Pruning', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: CR, text: 'You want the case for the Pruning? Good. Somebody should hear it before they vote against it. (She sits down on the Eldest’s root, which is the only comfortable one.) Three streets this year. Lantern Row, Thimble Steps, the Long Bough.', next: 'streets' },
      streets: {
        speaker: CR, text: 'Two hundred people living with their sisters. Nineteen cats living with Prudence Coddle, which is worse. And by spring three more streets, and three more after that. A tree that eats its own city is not a home. It is a very slow flood.',
        choices: [
          { text: 'And the Bloomkin who woke in that growth?', to: 'bloomkin' },
          { text: 'Do you want to burn it?', to: 'want' },
        ],
      },
      bloomkin: { speaker: CR, mood: 'sad', text: 'Go back to seed. Not dead. Seed. That is what I tell myself at night, and some nights it works. They are a year old, witch. Rootholme is six hundred.', next: 'end' },
      want: { speaker: CR, mood: 'sad', text: '(She looks at you over her spectacles for a long time.) I have chaired this ring for twenty years and been agreed with twice. I have never wanted to be agreed with less. No. I do not want to. I think we must.', next: 'end' },
      end: { speaker: CR, text: 'Speak your mind tonight. The ring is a poor thing, but it is the only place in Rootholme where everyone has to listen to everyone. Even to me.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-campion-canvass', name: 'I-5 Campion on Lantern Row', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: CA, text: '(A Bloomkin the height of a child, pink and ragged at the edges like a ragged-robin, standing on the new bark over Lantern Row. It is holding a lantern, lit, that it has clearly pulled out of the wood.) Hello. Are you the witch with the stone? I am Campion. I am guarding the street.', next: 'guard' },
      guard: {
        speaker: CA, text: 'I woke up here in the spring. Right here, on top of everyone. I could hear them under me, all night, the cats and the people. I thought they were dreaming. So I stayed, to keep watch, in case they woke up and were frightened.',
        choices: [
          { text: 'If the ring votes to prune, you go back to seed.', to: 'seed' },
          { text: 'Where did you find the lantern?', to: 'lantern' },
        ],
      },
      lantern: { speaker: CA, mood: 'happy', text: 'It was growing out of the bark like a flower. A warm one. I picked it. I hope that was all right. It belonged to somebody and I am keeping it for them until they come out.', next: 'seed' },
      seed: {
        speaker: CA, mood: 'sad', text: 'I know. Eldest Rue explained it very kindly. Seed is not dead, she says. Seed is only waiting. (It looks at the lantern.) But I have only just stopped waiting. I would like to be awake a bit longer, please.',
        choices: [
          { text: 'I’ll remember you when I speak.', to: 'remember', trust: 1, trustNpc: CA },
          { text: 'The people under the bark want to come out too, Campion.', to: 'out' },
        ],
      },
      remember: { speaker: CA, mood: 'happy', text: 'Thank you. That is a good thing to be. Remembered. I will stand at the edge of the ring tonight and hold my lantern up, so you can find me.', next: null },
      out: { speaker: CA, text: '(It is quiet for a long while.) Yes. They do. I have been listening to them. That is the difficult part. Everyone wants to come out of something.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-campion', name: 'Campion (general)',
    entries: [
      { when: { flag: 'hedgewitch.pruning', value: 'grow' }, node: 'grow' },
      { when: { flag: 'hedgewitch.pruning', value: 'winter' }, node: 'winter' },
      { node: 'start' },
    ],
    nodes: {
      start: { speaker: CA, text: '(It holds up its lantern, gravely, so you can see your way.) Still guarding. Still awake. Mind the knocker, it’s a fox.', next: null },
      grow: { speaker: CA, mood: 'happy', text: 'Still awake! I have been planting lanterns on the new bark, so that the streets underneath know where they are. Is that silly? The Eldest says it is a fire risk. She smiled when she said it.', next: null },
      winter: { speaker: CA, text: '(It yawns, enormously, petals and all.) I keep nodding off. It is lovely. I did not know sleep could feel like that. Like being tucked in by the whole tree.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hedgewitch-cobble-lane', name: 'I-5 dawn on Cobble Lane', scope: 'party',
    entries: [
      { when: { all: [stage(VOTE, 'dawn'), { flag: 'hedgewitch.pruning', value: 'grow' }] }, node: 'grow' },
      { when: { all: [stage(VOTE, 'dawn'), { flag: 'hedgewitch.pruning', value: 'winter' }] }, node: 'winter' },
      { when: stage(VOTE, 'dawn'), node: 'prune' },
      { node: 'plain' },
    ],
    nodes: {
      prune: { speaker: 'narrator', text: 'Dawn on Cobble Lane. The Circle’s fires have gone round in the night, a long careful line of them, and the new growth has burned back to grey ash that drifts in the light. Out of it, blinking, comes Lantern Row: doors, chimneys, a hat on a hook, and nineteen extremely cross cats.', next: 'prune2' },
      prune2: { speaker: 'narrator', text: 'Along the edge of the ash, in a neat row, lie hundreds of seeds, small and brown and still. One of them, ragged and pink at the tip, lies beside a lantern that is still lit. Yarrow is kneeling there, very quietly, putting the seeds into her apron one by one.', effects: [{ setFlag: 'hedgewitch.dawn_seen', value: 'prune' }], next: null },
      grow: { speaker: 'narrator', text: 'Dawn on Cobble Lane, or where Cobble Lane was. The bark has come down over it in the night, smooth and new, and the Bloomkin are all over it, planting little lanterns in the wood in rows, so the street underneath will know where it is.', next: 'grow2' },
      grow2: { speaker: 'narrator', text: 'Campion is at the front, with its lantern held up. At the end of the lane, by a doorstep that is now a knot in the bark, Yarrow stands with her hand on the wood where her mother’s house was. She does not say anything for a long time.', effects: [{ setFlag: 'hedgewitch.dawn_seen', value: 'grow' }], next: null },
      winter: { speaker: 'narrator', text: 'Dawn on Cobble Lane, and it is snowing leaves. Gold and brown and soft, they come down out of the crown of the Elder Tree in their thousands, and lie in drifts in the street, and nobody can remember the last time they had to sweep. The children are already throwing them.', next: 'winter2' },
      winter2: { speaker: 'narrator', text: 'Along the bark the Bloomkin are curled up asleep in the leaf-drifts, every one, Campion among them with its lantern in its arms. Yarrow is tucking leaves round them like blankets. “Back in the spring,” she is saying to each one. “Back in the spring.”', effects: [{ setFlag: 'hedgewitch.dawn_seen', value: 'winter' }], next: null },
      plain: { speaker: 'narrator', text: 'Cobble Lane, where Mother Yarrow was born, the youngest of nine.', next: null },
    },
  },

  // ======================= I-6 The Seed Vault: the overgrown aisles (one per vault room)
  clue('hedgewitch-vault-aisle-1', 'I-6 a vault aisle (1)', stage('quest:hedgewitch-the-seed-vault', 'aisles'),
    'You cut through the hedge into the first aisle. Drawers from floor to ceiling, each labelled in a tiny neat hand by the Turning it was gathered in. “Bluebell, 85th Turning.” “Hazel, 84th.” The newest drawer is thirty years old. Nobody has gathered seed since.', 'hedgewitch.aisle_1',
    'An aisle of seed drawers, cut back from the hedge.'),
  clue('hedgewitch-vault-aisle-2', 'I-6 a vault aisle (2)', stage('quest:hedgewitch-the-seed-vault', 'aisles'),
    'In the second aisle, clipped out of the hedge with loving care, a topiary woman with a ladder over her shoulder, looking up. It is not the Gardener. It is somebody the Gardener remembers. The clipping is so fresh the cuts are still green.', 'hedgewitch.aisle_2',
    'A topiary woman with a ladder, freshly clipped.'),
  clue('hedgewitch-vault-aisle-3', 'I-6 a vault aisle (3)', stage('quest:hedgewitch-the-seed-vault', 'aisles'),
    'The third aisle is a heap of clippings: Briarlings, thistles, things that came in to steal seed and were pruned. Among them, very small, a Bloomkin’s pruned stalk. Beyond the heap, the snip of the great shears stops. Something has heard you.', 'hedgewitch.aisle_3',
    'A heap of old clippings.', 'It prunes anyone who comes in. It does not know the difference between a thief and a guest. Nobody has told it the difference in thirty years.'),

  // ======================= I-7 What the Bramblewife Planted: the empty ward, the climb, telling Yarrow
  {
    id: 'dialogue:obj-hedgewitch-ward-clue-1', name: 'I-7 Ostara’s ward: the keeping-book', scope: 'party',
    entries: [{ when: stage('quest:hedgewitch-what-the-bramblewife-planted', 'ward'), node: 'book' }, { node: 'plain' }],
    nodes: {
      book: { speaker: 'narrator', text: 'Ostara’s ward-book, open on her table. Every patient for a year, in sticky green ink. Beside each name, where a healer would write “mended” or “gone”, she has written the same word: “kept”. Forty-one of them. The forty-first is Gran Burdock.', effects: [{ setFlag: 'hedgewitch.ward_1', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Ostara’s ward-book, shut.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hedgewitch-ward-clue-2', name: 'I-7 Ostara’s ward: the pots', scope: 'party',
    entries: [
      { when: { all: [stage('quest:hedgewitch-what-the-bramblewife-planted', 'ward'), { flag: 'hedgewitch.junction', value: 'capped' }] }, node: 'capped' },
      { when: stage('quest:hedgewitch-what-the-bramblewife-planted', 'ward'), node: 'pots' },
      { node: 'plain' },
    ],
    nodes: {
      pots: { speaker: 'narrator', text: 'Shelves of sealed pots under the sap-pipes, each one labelled, each one full of something gold with black in it. A pipe comes in through the wall and fills them, drip by drip. It is the new pipe from the tappers’ line. It is still drinking.', effects: [{ setFlag: 'hedgewitch.ward_2', value: true }], next: null },
      capped: { speaker: 'narrator', text: 'Shelves of sealed pots under the sap-pipes, half of them empty. The pipe from the tappers’ line is dry. Pinned beside it, in sticky green ink: “Line capped. Somebody meddling. Never mind, there is plenty more where the tree keeps it. O.”', effects: [{ setFlag: 'hedgewitch.ward_2', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Shelves of sealed pots under the sap-pipes.', next: null },
    },
  },
  clue('hedgewitch-ward-clue-3', 'I-7 Ostara’s ward: the twine', stage('quest:hedgewitch-what-the-bramblewife-planted', 'ward'),
    'A basket by the door, full of green grafting twine and cuttings, and a ladder gone from its hook. A trail of sticky footprints leads out of the ward and straight up the trunk, towards the Canopy Hollows. She went up in a hurry, and she did not wipe her feet.', 'hedgewitch.ward_3',
    'An empty ladder-hook by the ward door.'),
  {
    id: 'dialogue:area-hedgewitch-canopy-climb', name: 'I-7 banter: up into the Canopy', bark: true,
    entries: [{ when: stage('quest:hedgewitch-what-the-bramblewife-planted', 'grafts'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The grafts get fatter as you climb, and warmer, and the twine round them gets newer. High above, very faintly, somebody is humming a lullaby, and watering something.', next: null } },
  },
  {
    id: 'dialogue:hedgewitch-yarrow-ostara', name: 'I-7 telling Yarrow about Ostara', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: YA, text: '(She is at her table with the kettle and two cups, and she looks at your face and puts the second cup down very carefully.) It’s Ostara. Isn’t it. Sit down, dear. Tell me all of it. Don’t make it kinder than it is.', next: 'tell' },
      tell: {
        speaker: 'narrator', text: 'You tell her: the grafts in the crown, the pots of black sap, the forty-one kept, the Elder seed signed out with a sticky thumbprint. Yarrow listens with both hands round her cup and does not drink from it.',
        choices: [
          { text: 'She wants the Heartwood half, so the tree covers the world.', to: 'world' },
          { text: 'There was black in her bucket at the Deep Well. She called it the tree’s heart.', to: 'well', when: { flag: 'hedgewitch.well_black' } },
        ],
      },
      well: { speaker: YA, mood: 'sad', text: 'The tree’s heart. Oh, Ostara. She always did think the heart was the strongest part of anything. It isn’t, dear. It’s only the part that can’t stop.', next: 'world' },
      world: { speaker: YA, mood: 'afraid', text: 'So nothing ever has to go into the compost again. (She sets the cup down.) I know why. I’ve always known why. I was there, you see. I was the witch who sang her mother into the compost. Forty years ago. Ostara was nine.', next: 'mother' },
      mother: {
        speaker: YA, mood: 'sad', text: 'She stood at the edge of the heap with her fists clenched and wouldn’t sing. Wouldn’t cry, either. The next week she married a bramble patch. Everybody laughed. I laughed. I should have sat with her.',
        choices: [
          { text: 'You couldn’t have known what it would grow into.', to: 'known' },
          { text: 'She’s still that girl at the edge of the heap.', to: 'girl', trust: 1 },
        ],
      },
      known: { speaker: YA, text: 'No. That’s the trouble with seeds, dear. You never know what they’ll grow into. You only know you planted them. (She pats your hand.) Never mind me.', next: 'go' },
      girl: { speaker: YA, mood: 'sad', text: '(She closes her eyes.) Yes. Yes, she is. With her fists clenched. And she’s gone down into the heart of my tree to make sure nobody ever has to stand there again. I don’t know whether to be proud of her or frightened.', next: 'go' },
      go: { speaker: YA, text: 'Go down after her. Take the stone from her, if you can, and bring her back up, if she’ll come. And if she won’t, then tell her from me that I’m sorry I laughed. Go on. The tree will show you the way. (To the tree.) Won’t you.', next: null },
    },
  },

  // ======================= I-9 The Root Road: the Leaving Hazel (codex find)
  {
    id: 'dialogue:obj-hedgewitch-leaving-hazel', name: 'I-9 the Leaving Hazel', scope: 'party',
    entries: [{ when: stage('quest:hedgewitch-the-root-road', 'hazel'), node: 'hazel' }, { node: 'plain' }],
    nodes: {
      hazel: { speaker: 'narrator', text: 'Halfway down the Root Road, an old hazel leans over the way, and every low branch is tied with strips of cloth: apron-cotton, faded to the colour of dust, hundreds of them. One for every witch who ever left Rootholme, so the tree would remember who went.', next: 'strips' },
      strips: { speaker: 'narrator', text: 'Some have names stitched on. HENBANE. CORIANDER WEBB. On the lowest branch, a green strip so old it is nearly lace: N. BRIAR, FOR THE CONCORDANT’S GARDEN. The newest strip is thirty years faded. Nobody has left since the gate shut.', next: 'tie' },
      tie: {
        speaker: 'narrator', text: 'Your half-stone hums. The hazel’s leaves turn over, silver side up, as if waiting.',
        choices: [
          { text: '(Tear a strip from your sleeve and tie it on.)', to: 'tied', effects: [{ unlockLore: 'lore:hc-hedgewitch-leaving-hazel' }] },
          { text: '(Tie on a leaf from the Hushing Bough instead.)', to: 'leaf', effects: [{ unlockLore: 'lore:hc-hedgewitch-leaving-hazel' }] },
        ],
      },
      tied: { speaker: 'narrator', text: 'You tie it in a witch’s knot, the one Yarrow taught you for bandages. The hazel shivers from root to crown, and you walk on towards the gate with the feeling that a very large and very old thing has just learned your name.', next: null },
      leaf: { speaker: 'narrator', text: 'The leaf is still warm from the Hushing Bough. It sits among all that faded cloth like a green word in an old letter, and the hazel shivers, and lets you by.', next: null },
      plain: { speaker: 'narrator', text: 'The Leaving Hazel, tied with three hundred years of apron-strips, and one new one.', next: null },
    },
  },
  {
    id: 'dialogue:area-hedgewitch-root-road', name: 'I-9 banter: the Root Road', bark: true,
    entries: [{ when: stage('quest:hedgewitch-the-root-road', 'road'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The roots on the gate road are thick and black-veined here, and they have been dug through from underneath, recently, by something in a hurry. Sticky footprints come up out of the hole and go on ahead of you, towards the gate.', next: null } },
  },

  // ======================= Side: Too Many Cats (the register)
  {
    id: 'dialogue:hedgewitch-thaddeus-register', name: 'Too Many Cats: the register of cats', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TW, text: 'The register of Lantern Row cats? Volume nine. (He hauls it out from under the notice-bough.) Name, colour, temper, and date of first complaint. A new cat, you say. Name?', next: 'look' },
      look: { speaker: TW, text: 'Tibbs. Red. Dignified. (He writes, then stops, and runs his finger back up the page.) Funny. Prudence has always had nineteen. Eighteen living, and this one. “Marmalade. Red. Dignified. Died of old age last spring. Buried under the rose bush at number six.”', next: 'rose' },
      rose: {
        speaker: TW, text: 'The rose bush at number six was the first thing the tree swallowed. (He looks at you over the ledger.) It was a dog-rose. It made rose-hips. Small, round, red ones.',
        choices: [
          { text: 'Write him down as Tibbs. A new cat.', to: 'tibbs', effects: [{ setFlag: 'hedgewitch.tibbs', value: 'tibbs' }] },
          { text: 'Write it in Marmalade’s line. “Returned.”', to: 'marmalade', trust: 1, trustNpc: 'npc:prudence-coddle', effects: [{ setFlag: 'hedgewitch.tibbs', value: 'marmalade' }] },
        ],
      },
      tibbs: { speaker: TW, text: '“Tibbs. Red. Dignified. Rose-hip, provisional.” There. Every Bloomkin ought to get its own line. (He blots it.) I won’t say anything to Prudence. Some things a person finds out on her own, in her own time.', next: 'end' },
      marmalade: { speaker: TW, mood: 'happy', text: '(He crosses out “Died” very neatly and writes “Returned, as a rose-hip” above it.) Do you know, in thirty years that is the first time this register has had good news in it. Prudence will cry. I shall pretend not to notice.', next: 'end' },
      end: { speaker: TW, text: 'Nineteen cats on Lantern Row, then, as there always were. The Circle thanks you. I’ll pin it up. People like a cat notice.', next: null },
    },
  },

  // ======================= Side: the Compost Debate (the Old Heap)
  clue('hedgewitch-old-heap', 'The Compost Debate: the Circle’s Old Heap', stage('quest:hedgewitch-the-compost-debate', 'old-heap'),
    'The Circle’s Old Heap, at the very bottom of the Root Cellars: a great dark mound, steaming gently in the cold. You lay the cabbage leaf on top. By the time you have counted to a hundred, its edge has gone soft and brown. It is rotting. The heap is eating it, kindly, the way compost should.', 'hedgewitch.old_heap',
    'The Circle’s Old Heap, steaming, sweet-smelling, doing its job.', 'A slate is nailed to its post: “Laid down the winter of C. 1011, the last winter the tree slept.” It had its winter. Nothing above it ever did.'),
  {
    id: 'dialogue:hedgewitch-compost-truce', name: 'The Compost Debate: what the Old Heap said', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: HM, text: 'Well? Fennimore! FENNIMORE. Come over here, the witch is back. Both of us at once, I said. (Old Fennimore comes across the bough, which by the look on Hepzibah’s face he has not done in forty years.)', next: 'tell' },
      tell: {
        speaker: FC, text: 'Did it rot? The Old Heap? Tell me it rotted.',
        choices: [
          { text: 'It rotted. It was laid down the last winter the tree slept.', to: 'winter', insight: 'hedgewitch_winter' },
          { text: 'It rotted. Neither of you was wrong about compost. The tree just needs a winter.', to: 'both', trust: 1 },
        ],
      },
      winter: { speaker: FC, mood: 'happy', text: 'HA. The winter! Didn’t I say? Forty years I’ve said let the winter do the work, and she put NETTLES in it. (Hepzibah opens her mouth.) And the nettles were fine. The nettles were fine, Hepzibah.', next: 'truce' },
      both: { speaker: HM, mood: 'happy', text: 'Neither of us wrong. (She considers this, as if it were an unusual vegetable.) I don’t think I’ve been neither-wrong with Fennimore Clay since before the Concord was a lad.', next: 'truce' },
      truce: { speaker: HM, text: 'Right. When this is over, and the tree sleeps again, we’ll turn one heap between us. His winter and my Tuesdays. (Fennimore holds out a hand, earthy to the wrist. She shakes it, earthier.)', next: 'end' },
      end: { speaker: FC, text: 'She’ll still put nettles in. (Hepzibah: “I will.”) Thank you, witch. Forty years. You’d think one of us would have gone and looked.', next: null },
    },
  },

  // ======================= Side: A Sticky Situation (the junction)
  {
    id: 'dialogue:obj-hedgewitch-sap-junction', name: 'A Sticky Situation: the new pipe', scope: 'party',
    entries: [{ when: stage('quest:hedgewitch-a-sticky-situation', 'junction'), node: 'pipe' }, { node: 'plain' }],
    nodes: {
      pipe: { speaker: 'narrator', text: 'Low on the Well wall, behind a curtain of moss, someone has fitted a new pipe into the tappers’ line with a good, careful joint. It draws the sap away sideways and up, towards the Sap Wells’ wards. The joint is wrapped in green twine, and the twine is sticky.', next: 'pull' },
      pull: {
        speaker: 'narrator', text: 'You can feel it pulling, through the wood, like a drinker at a straw. Every tap on this line has been giving up its sap to it. Dunstan was simply the tapper who held on.',
        choices: [
          { text: '(Cap the new pipe with a bung from your pack.)', to: 'cap', effects: [{ setFlag: 'hedgewitch.junction', value: 'capped' }] },
          { text: '(Leave it. Find out who fitted it first.)', to: 'leave', effects: [{ setFlag: 'hedgewitch.junction', value: 'left' }] },
        ],
      },
      cap: { speaker: 'narrator', text: 'The bung goes in with a squeak. All along the tappers’ line the taps cough, and gurgle, and begin to run freely for the first time in a year. Somewhere up the Well a tapper cheers.', next: null },
      leave: { speaker: 'narrator', text: 'You leave it drinking. The twine on the joint is the same green twine every healer in the Sap Wells uses for splints. There are not so very many healers in the Sap Wells.', next: null },
      plain: { speaker: 'narrator', text: 'The tappers’ line, running down the Well wall.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-dunstan-junction', name: 'A Sticky Situation: telling Dunstan', scope: 'party',
    entries: [{ when: { flag: 'hedgewitch.junction', value: 'capped' }, node: 'capped' }, { node: 'left' }],
    nodes: {
      capped: { speaker: DT, mood: 'happy', text: 'Was that you? The whole line’s running like a spring. My tap’s never poured like it. (He pats it, then snatches his hand back on principle.) Somebody was drinking our sap? Bold as brass. Mustn’t grumble. I’ll grumble a bit.', next: 'who' },
      left: { speaker: DT, text: 'A new pipe? On the tappers’ line? Nobody asked the tappers. (He frowns, which on Dunstan is a terrible thing to see.) Three days I was stuck to that tap, being brave, and it was somebody’s straw.', next: 'who' },
      who: {
        speaker: DT, text: 'Green twine on the joint, you say? (He goes quiet.) That’s healers’ twine. There’s only one healer down here fits her own pipes.',
        choices: [
          { text: 'Don’t say anything yet, Dunstan.', to: 'quiet', trust: 1 },
          { text: 'Then she has some explaining to do.', to: 'explain' },
        ],
      },
      quiet: { speaker: DT, text: 'Wouldn’t dream of it. She mended my wrist last winter. (He looks at his wrist, which is very slightly green at the knuckle, and pulls his sleeve down over it.) Mustn’t grumble.', next: null },
      explain: { speaker: DT, mood: 'sad', text: 'She does. She does. Only who’s going to ask her? Half the Wells owe her their lives. The other half owe her their mothers’ lives. Here. Have a cake. It’s mostly tap.', next: null },
    },
  },

  // ======================= Side: Gran Hasn’t Said a Word (the peppermints)
  clue('hedgewitch-peppermint-jar', 'Gran Hasn’t Said a Word: the peppermint jar', stage('quest:hedgewitch-gran-hasnt-said-a-word', 'peppermints'),
    'The sap-sweet stall on the Bough Markets, open again since Pruning Day. The sweet-seller twists a paper of peppermints for you from a big glass jar at the back. “Burdock’s Gran? She bought these every week for forty years. For the boy.” She will not take your money.', 'hedgewitch.peppermints',
    'A glass jar of old-fashioned peppermints at the sweet stall.'),
  {
    id: 'dialogue:hedgewitch-gran-peppermints', name: 'Gran Hasn’t Said a Word: the peppermints', scope: 'party',
    entries: [{ node: 'sit' }],
    nodes: {
      sit: { speaker: GB, mood: 'hollow', text: '(Gran Burdock, in her shawl, in the sun outside the ward, smiling at the wall. Ned is sitting on the step a little way off, pretending not to watch.)', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'The twist of peppermints is warm from your pocket. The smell of them comes up sharp and clean through the sweet green smell of the ward.',
        choices: [
          { text: '(Slip them into her apron pocket, where they used to be.)', to: 'pocket' },
          { text: '(Hold the twist under her nose.)', to: 'nose' },
        ],
      },
      pocket: { speaker: 'narrator', text: 'For a long moment nothing. Then her hand moves, slowly, the way a root moves, down to the apron pocket, and closes on the paper, the way it must have closed on it every week for forty years.', next: 'turn' },
      nose: { speaker: 'narrator', text: 'Her nostrils flare, very slightly. The smile does not change. But her eyes come away from the wall, slowly, and travel along the path, and stop on the step where Ned is sitting.', next: 'turn' },
      turn: { speaker: GB, mood: 'hollow', text: '(She holds out one peppermint towards the step. Her arm is green to the wrist. She does not speak. She does not need to.)', next: 'ned' },
      ned: { speaker: ND, mood: 'sad', text: '(He comes and takes it, very carefully, as if it might break.) Thanks, Gran. (He sits down at her feet and leans against her knees, and she lets him, and goes on smiling at nothing.) She knew me. Didn’t she? Just then. She knew it was me.', next: 'end' },
      end: { speaker: 'narrator', text: 'You leave them there in the sun, the boy and the smiling woman and the smell of peppermints, and you do not look back, because you are not sure what you would see.', effects: [{ setFlag: 'hedgewitch.gran_peppermint', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-ned-after', name: 'Ned Burdock (after the peppermints)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: ND, text: 'She gave me a peppermint. She didn’t say anything. But she gave me one. (He holds up a twist of paper, empty, folded very small.) I’m keeping the paper.', next: null } },
  },

  // ======================= Side: Moving Day (Agnes and the doorframe)
  {
    id: 'dialogue:obj-hedgewitch-mudlark-frame', name: 'Moving Day: Agnes and the doorframe', scope: 'party',
    entries: [{ when: stage('quest:hedgewitch-moving-day', 'agnes'), node: 'agnes' }, { node: 'plain' }],
    nodes: {
      agnes: { speaker: 'narrator', text: 'Deep in the root-tunnels, where the Mudlarks’ back wall used to be, a girl of about nine is sawing at a strip of old doorframe with a bread knife. The roots are closing round her, slowly, and she is crying, and she is not stopping.', next: 'marks' },
      marks: {
        speaker: 'narrator', text: 'The strip of doorframe is scored all the way up with pencil lines and names. AGNES, 5. AGNES, 7. HESTER, 6, in faded brown. Four generations of Mudlarks, measured against the same door. “Mam wouldn’t have left it,” says Agnes. “She just thought she had to.”',
        choices: [
          { text: '(Take the knife and help her cut it free.)', to: 'cut' },
          { text: '[Verdant] (Ask the roots to let go of the frame.)', to: 'ask', school: 'verdant' },
        ],
      },
      cut: { speaker: 'narrator', text: 'Between you, you get it out: a long splintered strip as tall as a man, with all the little lines on it. Agnes carries it up the tunnels on her shoulder like a banner, and will not let you take a turn.', effects: [{ setFlag: 'hedgewitch.mudlark_frame', value: true }], next: null },
      ask: { speaker: 'narrator', text: 'The roots consider it. Then, with a creak like an old man getting up, they draw back from the frame and let it fall out into Agnes’s arms. She stares at you. “Can you teach me that?” she says. “Later,” you say. “Up first.”', effects: [{ setFlag: 'hedgewitch.mudlark_frame', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Root-tunnels where the Mudlarks’ house used to be.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-hester-frame', name: 'Moving Day: the doorframe', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: HS, mood: 'angry', text: 'AGNES MUDLARK. You go down into the roots with my bread knife and you don’t tell a soul, and you… what is that. (She stops.) What is that.', next: 'frame' },
      frame: {
        speaker: HS, mood: 'sad', text: '(She takes the strip of doorframe from Agnes and runs her thumb up the lines, one after another, all the way to the top, where it says GRAN, 12, in letters nobody living wrote.) Oh. Oh, you daft, brave child. Oh, my mother’s mother.',
        choices: [
          { text: 'Hang it in the new house. Keep measuring.', to: 'hang', trust: 1 },
          { text: 'She wouldn’t leave it. She was right.', to: 'right' },
        ],
      },
      hang: { speaker: HS, mood: 'happy', text: 'On my sister’s parlour wall. She’ll hate it. (She pulls Agnes in under one arm, hard.) Stand up straight, you. Let’s see how much you’ve grown since this morning. Feels like a lot.', next: 'end' },
      right: { speaker: HS, text: 'She was. She usually is, which is what makes her impossible. (She pulls Agnes in under one arm, hard.) Next time, you tell me. And you take the good knife.', next: 'end' },
      end: { speaker: HS, text: 'Thank you, witch. You brought me back the house. The bit of it that mattered.', next: null },
    },
  },

  // ======================= Side: What Is Thistledown For? (the list at the Cellar Mouth)
  {
    id: 'dialogue:obj-hedgewitch-thistle-list', name: 'What Is Thistledown For?: the list', scope: 'party',
    entries: [
      { when: { all: [stage('quest:hedgewitch-what-is-thistledown-for', 'list'), { flag: 'hedgewitch.thistledown_answer', value: 'spread' }] }, node: 'spread' },
      { when: { all: [stage('quest:hedgewitch-what-is-thistledown-for', 'list'), { flag: 'hedgewitch.thistledown_answer', value: 'choose' }] }, node: 'choose' },
      { when: stage('quest:hedgewitch-what-is-thistledown-for', 'list'), node: 'dunno' },
      { node: 'plain' },
    ],
    nodes: {
      spread: { speaker: 'narrator', text: 'Pinned to the bark at the Cellar Mouth with a thorn: a dock leaf, scratched all over in careful wobbly marks. A list. “1. Lantern: for seeing. 2. Compost: for becoming. 3. Cradle: for keeping. 4. You: for asking. 5. Me: for where nothing grows yet.”', next: 'fluff' },
      choose: { speaker: 'narrator', text: 'Pinned to the bark at the Cellar Mouth with a thorn: a dock leaf, scratched all over in careful wobbly marks. A list. “1. Lantern: for seeing. 2. Compost: for becoming. 3. Cradle: for keeping. 4. You: for asking. 5. Me: to be decided. (Somewhere with more room.)”', next: 'fluff' },
      dunno: { speaker: 'narrator', text: 'Pinned to the bark at the Cellar Mouth with a thorn: a dock leaf, scratched all over in careful wobbly marks. A list. “1. Lantern: for seeing. 2. Compost: for becoming. 3. Cradle: for keeping. 4. You: for looking. 5. Me: also for looking. We are the same so far.”', next: 'fluff' },
      fluff: { speaker: 'narrator', text: 'Caught on the thorn beside it is one white tuft of thistledown. The wind from the wilds lifts it, and it goes, out of the Cellar Mouth and over the bramble, after the rest.', effects: [{ setFlag: 'hedgewitch.thistledown_list', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Cellar Mouth, where the roots of the Elder Tree open on to the wilds. A thorn in the bark, with nothing on it now.', next: null },
    },
  },

  // ======================= Side: Kite Weather (the race)
  {
    id: 'dialogue:obj-hedgewitch-launching-ledge', name: 'Kite Weather: the Canopy kite-race', scope: 'party',
    entries: [{ when: stage('quest:hedgewitch-kite-weather', 'race'), node: 'ledge' }, { node: 'plain' }],
    nodes: {
      ledge: { speaker: 'narrator', text: 'The Launching Ledge, on the windward side of the Hollows, crowded with children and kites and one Briarling who has been allowed to watch if it behaves. Hyssop is holding the red kite with the bitten ear. Its painted face is scowling, and very old, and wearing a bonnet.', next: 'face' },
      face: { speaker: 'npc:hyssop-haws', text: 'It’s Grandmother Sloe. She won the race eleven times. I painted her so she’d be in it again. Don’t tell her. She’ll say the nose is wrong. (The horn goes.) GO!', next: 'fly' },
      fly: {
        speaker: 'narrator', text: 'The kites go up like a flock of startled birds. The red one climbs fast, scowling at the sky, neck and neck with a blue fish and a yellow star. The string burns in your hands.',
        choices: [
          { text: '(Fly it true, and let the wind decide.)', to: 'true', effects: [{ setFlag: 'hedgewitch.kite_race', value: 'true' }] },
          { text: '(Give Hyssop the string for the last stretch.)', to: 'hyssop', effects: [{ setFlag: 'hedgewitch.kite_race', value: 'hyssop' }] },
          { text: '[Verdant] (Ask the high boughs, very politely, for a little lift.)', to: 'lift', school: 'verdant', effects: [{ setFlag: 'hedgewitch.kite_race', value: 'lift' }] },
        ],
      },
      true: { speaker: 'narrator', text: 'The wind decides on the blue fish, by a tail. Second. Hyssop is outraged, then thrilled, then outraged again. Across on the kite-bough, a very old woman is on her feet shaking her stick at the sky and shouting, “HIGHER, girl! HIGHER!”', next: 'end' },
      hyssop: { speaker: 'narrator', text: 'Hyssop takes the string with both fists and her tongue between her teeth, and the scowling red face goes over the finish bough first by a nose. The wrong nose, apparently. Across on the kite-bough a very old woman is laughing so hard she has to sit down.', next: 'end' },
      lift: { speaker: 'narrator', text: 'A bough creaks, very slightly, upwind, and a breath of air comes off it under the red kite like a hand under a chin. It wins by the length of a cat. Nobody can prove anything. The Briarling looks at you suspiciously.', next: 'end' },
      end: { speaker: 'npc:hyssop-haws', mood: 'happy', text: 'Next year I’m painting YOU. With a scowl. You’ve got a good scowl. (She hugs you round the middle, briefly, like a punch.) Thanks for getting her back.', next: null },
      plain: { speaker: 'narrator', text: 'The Launching Ledge, littered with kite-string and apple cores.', next: null },
    },
  },

  // ======================= Side: the Topmost Leaf (the Liar’s Fork)
  {
    id: 'dialogue:obj-hedgewitch-liars-fork', name: 'The Topmost Leaf: the Liar’s Fork', scope: 'party',
    entries: [{ when: stage('quest:hedgewitch-the-topmost-leaf', 'fork'), node: 'fork' }, { node: 'plain' }],
    nodes: {
      fork: { speaker: 'narrator', text: 'The fork Wenna described, halfway up the canopy, where the trunk splits in two and the view opens out over all of Wildheart. It is a very good place to sit and be afraid of the rest of the climb. You find out at once that you are not the first to think so.', next: 'names' },
      names: { speaker: 'narrator', text: 'The bark of the fork is cut all over with initials. Hundreds. Some are a century old. Under many of them, in the same hands, tiny and ashamed: “didn’t go on”. Half the grandmothers of Rootholme have touched the topmost leaf, and most of them touched it here.', next: 'carve' },
      carve: {
        speaker: 'narrator', text: 'There is a clean space at the top of the fork, with the best of the view.',
        choices: [
          { text: '(Cut W. S. there, and under it: “saw the willow”.)', to: 'willow', effects: [{ unlockLore: 'lore:hc-hedgewitch-liars-fork' }] },
          { text: '(Cut W. S. there, and nothing else. It is her fork.)', to: 'plain2', effects: [{ unlockLore: 'lore:hc-hedgewitch-liars-fork' }] },
        ],
      },
      willow: { speaker: 'narrator', text: 'W. S. SAW THE WILLOW. It is the only set of initials on the fork that says what somebody saw, rather than where they stopped. When you look up from it, there it is, very far away in Morvane: a willow on a hill, weeping. She was right. You can see it from here.', next: null },
      plain2: { speaker: 'narrator', text: 'W. S., deep and clean, at the top of the fork, above all the others. When you look up from it you can see the whole of Wildheart, and, very far off, a willow on a hill, weeping. She was right. It is the best view in the tree.', next: null },
      plain: { speaker: 'narrator', text: 'The Liar’s Fork, cut all over with initials. The newest is W. S.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in Rootholme’s ruin, cave and viewpoint
  find('verdant-capital-ruin-find', 'Rootholme ruin: the Winter House',
    'In the roofless ruin, on a door that still hangs from one hinge, a rota is pinned under a rusted nail: “Winter sleepers, C. 1011. Blankets: Yarrow (young). Lanterns out by ten. Wake the tree gently in spring, or it sulks till June.” Under it, scratched later in a shaking hand: “It never slept again.”',
    'lore:hc-verdant-capital-ruin'),
  find('verdant-capital-cave-find', 'Rootholme cave: the ring-wall',
    'At the end of the cave the taproot’s wood is exposed, cut smooth by someone long ago, and you can read the tree’s rings like a book. Wide rings, one a year, for a thousand years. Then, at the edge, they crowd: dozens to a thumb’s width, hundreds, too fine to count, all thirty years of them crammed into the last finger of wood.',
    'lore:hc-verdant-capital-cave'),
  find('verdant-capital-cave-codex', 'The Taproot Hollow: a ring-counter’s slate',
    'A Circle ring-counter’s slate, hung on a peg in the dark. Columns of chalk tallies, one a day, neat at first, then hurried. The last line: “Day nine thousand and something. I have stopped counting. The tree has not. If anyone finds this, tell the Circle I tried.”',
    'lore:hc-verdant-capital-tally'),
  find('verdant-capital-view-find', 'Rootholme viewpoint: the swallowed streets',
    'On the gallery rail somebody has chalked a map of Rootholme’s streets, the way a child would, with the names in capitals. Year by year, in different chalk, street after street has been crossed out and labelled GROWN OVER. The newest line, still bright, goes through LANTERN ROW.',
    'lore:hc-verdant-capital-view'),
  {
    id: 'dialogue:area-verdant-capital-view', name: 'Rootholme viewpoint banter',
    bark: true, entries: [{ when: { heroClass: 'hedgewitch' }, node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'From up here the Bough Markets look like a necklace somebody dropped in a hedge. You can hear Hepzibah Marl from here. You can probably hear her from Concordia.', next: null } },
  },
  // ======================= ACT II, C-1 Thornhollow: the road in, thirty years of Wildheart in pots
  {
    id: 'dialogue:area-hedgewitch-briar-road', name: 'C-1 banter: the road to Briar Hollow', bark: true,
    entries: [{ when: stage(C1, 'hedge'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The road to Briar Hollow runs between hedges, and every hedge was laid by somebody who knew what they were doing: Rootholme hands, thirty years ago. Your half-stone hums at them as you pass, the way you would nod to a neighbour.', next: null } },
  },
  {
    id: 'dialogue:obj-hedgewitch-hedge-pots', name: 'C-1 the Hedge House pots', scope: 'party',
    entries: [{ when: stage(C1, 'pots'), node: 'pots' }, { node: 'plain' }],
    nodes: {
      pots: { speaker: 'narrator', text: 'The back room of the Hedge House is all pots: on shelves, on the floor, up the stairs, hanging from the beams. Every one is labelled in a careful hand with a Rootholme bough-street. “Lantern Row.” “The Sap Wells, lower.” “Compost Bough. Do NOT water.”', next: 'teasel' },
      teasel: {
        speaker: TG, text: 'We all brought cuttings through for the Turning. Then the arches shut, so I kept them. Thirty years. Half of Rootholme is in this room, if you squint and talk to it nicely.',
        choices: [
          { text: '(Look for the pot with your own street on it.)', to: 'street' },
          { text: '[Verdant] (Sing the bough-song to the pots.)', to: 'sing', school: 'verdant', trustNpc: TG, trust: 1 },
          { text: 'Thirty years, and you never lost one?', to: 'lost' },
        ],
      },
      street: { speaker: 'narrator', text: 'There it is, on the top shelf: a thin green sprig of whatever grew outside your own front door, labelled in the same careful hand. It is alive. It is sulking. It is very definitely yours.', next: 'mint' },
      sing: { speaker: 'narrator', mood: 'happy', text: 'You hum the bough-song every Rootholme child learns before it can walk, and all round the room the leaves turn, slowly, silver side up. Teasel sits down on a pot of thyme and does not notice for some time.', next: 'mint' },
      lost: { speaker: TG, mood: 'sad', text: 'Two. A fern in the hard winter of ’19, and a geranium I think did it on purpose. I kept the pots. You don’t throw away a pot from home.', next: 'mint' },
      mint: {
        speaker: TG, text: 'Now. You’ll want something for Nan’s kettle, and it had better be good. (He snips a sprig from the Lantern Row pot.) Lantern Row mint. The cats used to sleep on it. She’ll know.',
        effects: [{ setFlag: 'hedgewitch.nan_mint', value: true }], next: null,
      },
      plain: { speaker: 'narrator', text: 'The back room of the Hedge House, full of pots from home. The Lantern Row mint has a sprig missing.', next: null },
    },
  },

  // ======================= ACT II, C-2 The Willow’s Roots: the Gloamwood, the Willow’s bark
  {
    id: 'dialogue:area-hedgewitch-gloam-road', name: 'C-2 banter: into the Gloamwood', bark: true,
    entries: [{ when: stage(C2, 'roots'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The Gloamwood is old and teal and glowing, and under the smell of moss it smells of black sap. Somewhere ahead something is weeping. Your half-stone, which has never once been quiet in its life, goes quiet to listen.', next: null } },
  },
  {
    id: 'dialogue:obj-hedgewitch-willow-bark', name: 'C-2 the Willow’s bark', scope: 'party',
    entries: [{ when: stage(C2, 'listen'), node: 'bark' }, { node: 'plain' }],
    nodes: {
      bark: { speaker: 'narrator', text: 'The Willow’s trunk at the top of Stag’s Rest, wide as a cottage and wet with black. Under your palm the bark is warm and ridged, and it is the Elder Tree’s bark exactly: the whorls you climbed as a child, the knot shaped like a thumb.', next: 'lean' },
      lean: {
        speaker: 'narrator', text: 'Your half-stone hums. Something very large and very slow notices you, the way the Elder Tree notices a witch on the bower step, and leans.',
        choices: [
          { text: 'Good evening. Mother Yarrow still talks to your mother every day.', to: 'yarrow', effects: [{ setFlag: 'hedgewitch.willow_told', value: true }] },
          { text: '[Verdant] (Listen the way Yarrow taught you, with your whole hand.)', to: 'listen', school: 'verdant' },
          { text: '(Take your hand away. It’s a Sentinel, not your gran.)', to: 'away' },
        ],
      },
      yarrow: { speaker: 'narrator', text: 'The bark goes still under your hand, like a held breath. Far down in the roots something sighs, and one black tear stops halfway down the trunk and does not fall.', next: 'end' },
      listen: { speaker: 'narrator', text: 'Under the weeping there is a word, said over and over, slow as a seed opening. It is not a word in any tongue. As near as you can tell, it means: tired.', next: 'end' },
      away: { speaker: 'narrator', text: 'You take your hand away. The bark is warm where it was. Above you a twig taps your shoulder, twice, very softly, like a cousin who would like to be introduced properly.', next: 'end' },
      end: { speaker: 'narrator', text: 'Below the hill, among the roots, the way down into the Willow’s hollow stands open and weeping. It has been waiting thirty years for somebody from home.', next: null },
      plain: { speaker: 'narrator', text: 'The Weeping Willow’s trunk, the same bark as the Elder Tree’s.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Bramblewife’s Graft: Jennet Wadeley, who saw her
  {
    id: 'dialogue:hedgewitch-jennet-witness', name: 'C-4 Jennet Wadeley at the edge of the deep bog', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: JW, text: '(She plants her eel-spear in the mud and leans on it, breathing hard.) There. That’s where I lost my best trap, and that’s where I saw her, every night for a month. Don’t look at me like that. I wasn’t following her. I was following my eels.', next: 'saw' },
      saw: {
        speaker: JW, text: 'Comes out at moonrise with two pails on a yoke, singing. Pretty voice. Goes right out to the deep water where nobody goes, pours them in, and the whole bog goes quiet, like it’s listening. Then she ties a bow on the empty pail.',
        choices: [
          { text: 'What does she pour in?', to: 'pour' },
          { text: 'She ties a bow on it?', to: 'bow' },
          { text: '[Verdant] (Kneel and put your hand in the bog.)', to: 'kneel', school: 'verdant' },
        ],
      },
      pour: { speaker: JW, text: 'Black. Thick as treacle, and it smells sweet, like a sap-house. The eels won’t go near it. That’s how I knew. Eels will eat anything, and they won’t eat that.', next: 'asked' },
      bow: { speaker: JW, text: 'Every pail. Lovely bows. Then she walks back past my hut and waves, and asks after my knees. Says she’s a healer and I can come to her about them any time. (She shudders.) I’d sooner the eels.', next: 'asked' },
      kneel: { speaker: 'narrator', text: 'The water is warm, warmer than any bog has a right to be, and it pulls at your fingers, very gently, the way a baby pulls at a sleeve. Something out in the deep is drinking and drinking, and it is not full.', next: 'asked' },
      asked: { speaker: JW, mood: 'afraid', text: 'And last night she asked after you. Not by name. “Has a witch come from home yet, with leaf-mould on their boots? Tell them not to be cross.” (She looks at your boots.) So I’m telling you.', next: 'cross' },
      cross: {
        speaker: JW, text: 'Well? Are you cross?',
        choices: [
          { text: 'No. I’m frightened for her.', to: 'worried' },
          { text: 'Thank you for bringing me out here, Jennet.', to: 'thanks', trust: 1 },
        ],
      },
      worried: { speaker: JW, text: 'Frightened’s worse. Cross you can sleep off.', next: 'end' },
      thanks: { speaker: JW, mood: 'happy', text: 'Don’t thank me. Find my trap. It was a good trap.', next: 'end' },
      end: { speaker: JW, text: 'Her pails are along the bramble, where the channel goes out. Mind the deep water. There’s a stone monk in it, and he doesn’t blink.', next: null },
    },
  },
  {
    id: 'dialogue:hedgewitch-jennet', name: 'Jennet Wadeley (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: JW, text: 'Back again? Eels are a shilling a string. Unless you’ve found my trap, in which case they’re free and I’ll kiss you.',
        choices: [
          { text: 'How long have you trapped the bog?', to: 'long' },
          { text: '(Sit with her on the step of her hut.)', to: 'sit', when: { trust: JW, value: 'friendly' } },
          { text: 'Farewell.', to: null, tag: 'leave' },
        ],
      },
      long: { speaker: JW, text: 'Forty years, girl and woman. My mam before me, and hers. Wadeleys don’t leave the bog. Mostly the bog doesn’t let you.', next: null },
      sit: { speaker: JW, text: 'The Turning used to come through Briar Hollow, you know. Your witches bought eels off my mam for their supper, every twelve years, and paid in seed, because witches never have any money.', next: 'seed' },
      seed: { speaker: JW, text: 'Then the arches shut, and the witches stopped coming. The seed didn’t stop. (She points her spear at a stand of foxgloves that have no business growing in a bog.) Rootholme’s, those. I keep the eels off them.', next: 'secret' },
      secret: {
        speaker: JW, mood: 'happy', text: 'Half the flowers in the Hollow are Wildheart’s, if you know how to look. Nobody knows but me. And now you. Don’t tell Nan. She’ll want to charge them rent.',
        choices: [{ text: 'Your secret’s safe.', to: null }, { text: '[Verdant] (Say good evening to the foxgloves.)', to: 'fox', school: 'verdant' }],
      },
      fox: { speaker: 'narrator', text: 'The foxgloves nod, all together, though there is no wind. Jennet looks at them, and at you, and decides not to ask.', next: null },
    },
  },

  // ======================= ACT II, C-5 The Ooze Sovereign: what Ostara left in its bed
  clue('hedgewitch-graft-knife', 'C-5 Ostara’s grafting knife', stage(C5, 'graft'),
    'In the mud where the Sovereign sat lies a grafting knife with a bone handle: Ostara’s, the one she used on the Sap Wells’ roses. Beside it lies the husk of the Elder Tree’s seed, split and empty. Something was cut, and bound, and taken away.', 'hedgewitch.graft_seen',
    'The Sovereign’s bed, drained and still.', 'A twist of green ribbon is tied round the handle in a neat bow, with a label: “Done, love. It eats and it grows and it will never stop. I’m taking it where it’s needed. Don’t follow. You will, though. O.”'),

  // ======================= ACT II, C-6 A Letter from Yarrow: the reply
  {
    id: 'dialogue:obj-hedgewitch-reply-briar', name: 'C-6 a leaf for the briar to carry home', scope: 'party',
    entries: [{ when: stage(C6, 'reply'), node: 'leaf' }, { node: 'plain' }],
    nodes: {
      leaf: { speaker: 'narrator', text: 'The briar on the Verdant arch has put out one new leaf since this morning, right where Yarrow’s letter was caught. It is the size of a dinner plate, and it is waiting, the way the tree waits for Yarrow to finish a sentence.', next: 'write' },
      write: {
        speaker: 'narrator', text: 'You have a stick of charcoal and a leaf the size of a dinner plate. What do you send home?',
        choices: [
          { text: '“The other half sings. It smells of leaf-mould. We argued about compost. I am eating something green.”', to: 'sent', effects: [{ setFlag: 'hedgewitch.reply', value: 'compost' }] },
          { text: '“Ostara has grafted the seed. It eats and it grows. I am going to sing it a winter.”', to: 'sent', effects: [{ setFlag: 'hedgewitch.reply', value: 'winter' }] },
          { text: '“Tell the tree I’m coming home. Tell it in front of the whole Circle.”', to: 'sent', effects: [{ setFlag: 'hedgewitch.reply', value: 'home' }] },
          { text: '“Tell the tree I heard it too.”', to: 'sent', when: { flag: 'hedgewitch.yarrow_devotable' }, effects: [{ setFlag: 'hedgewitch.reply', value: 'heard' }] },
        ],
      },
      sent: { speaker: 'narrator', text: 'You tuck the leaf into the briar. The briar rolls it tight and passes it back along its own stems into the stone of the arch, the way a hedge passes a wren. It has gone home. You feel it go, like a splinter coming out.', next: null },
      plain: { speaker: 'narrator', text: 'The Verdant arch, wound with briar. One stem is bare where a leaf has been.', next: null },
    },
  },

  // ======================= ACT III, Yarrow’s Acorn: gone cold, Nan Briar’s old garden
  {
    id: 'dialogue:obj-hedgewitch-camp-bedroll', name: 'Yarrow’s Acorn: gone cold at the Heart camp', scope: 'party',
    entries: [
      { when: { all: [stage(ACORN, 'cold'), { flag: 'hedgewitch.yarrow_acorn' }] }, node: 'acorn' },
      { when: stage(ACORN, 'cold'), node: 'leaf' },
      { node: 'plain' },
    ],
    nodes: {
      acorn: { speaker: 'narrator', text: 'Yarrow’s acorn, on its cord round your neck since Rootholme. It has been warm for thirty-one years, the way a hand is warm. This morning, at the edge of the Heart, it is as cold as a pebble.', next: 'why' },
      leaf: { speaker: 'narrator', text: 'Yarrow’s leaf, folded in your pack since the Gate Circle. It stayed green all the way, as if the tree were still holding the other end. This morning, at the edge of the Heart, it has gone brown at the edges.', next: 'why' },
      why: {
        speaker: 'narrator', text: 'Everything in the Heart is black ground and tears. Nothing has grown here in thirty years.',
        choices: [
          { text: '(Hold it to your ear, the way Yarrow listens to the tree.)', to: 'ear' },
          { text: '[Verdant] (Breathe on it, to warm it.)', to: 'breathe', school: 'verdant' },
        ],
      },
      ear: { speaker: 'narrator', text: 'Nothing. Then, very faint, the smallest sound of something wanting. Not dying. Wanting. It wants earth: not black stone, but real earth that something has grown in.', next: 'nan' },
      breathe: { speaker: 'narrator', text: 'It warms in your hands and goes cold again at once, like a child who has been woken and wants to go back to sleep somewhere it knows.', next: 'nan' },
      nan: { speaker: 'narrator', text: 'Nan Briar told you over the mint tea: when she was the Concordant’s gardener, her beds ran right down to the foot of the Twelve Stairs. She dug every one herself. If there is real earth anywhere in the Heart, it is there.', next: null },
      plain: { speaker: 'narrator', text: 'Your bedroll at the Heart camp.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hedgewitch-concordant-bed', name: 'Yarrow’s Acorn: Nan Briar’s old garden bed', scope: 'party',
    entries: [{ when: stage(ACORN, 'bed'), node: 'bed' }, { node: 'plain' }],
    nodes: {
      bed: {
        speaker: 'narrator', text: 'At the foot of the Twelve Stairs, under a crust of black glass, the stone edging of a garden bed. A little lead label is still pushed into the corner, in a sharp, sloping hand: “Sage, for the Concordant’s tea. N. B., C. 988.”',
        choices: [
          { text: '(Break the crust and dig.)', to: 'dig' },
          { text: '[Verdant] (Ask the bed first.)', to: 'ask', school: 'verdant' },
        ],
      },
      ask: { speaker: 'narrator', text: 'You lay your palm on the black crust. Under it something very small and very patient says yes.', next: 'dig' },
      dig: { speaker: 'narrator', mood: 'happy', text: 'Under the black the soil is dark and crumbling and alive. A worm looks up at you, astonished. Thirty years under glass, and Nan’s garden has simply been waiting, the way gardens do.', effects: [{ setFlag: 'hedgewitch.nan_soil', value: true }], next: 'warm' },
      warm: { speaker: 'narrator', text: 'You take a double handful and wrap it in your scarf. Against your chest the thing you carry from Yarrow warms at once, like a cat that has found the sunny step.', next: null },
      plain: { speaker: 'narrator', text: 'Nan Briar’s old garden bed at the foot of the Stairs, broken open. A worm is supervising.', next: null },
    },
  },

  // ======================= ACT III, Gran Burdock’s Rest: where her roots go
  clue('hedgewitch-gran-pail', 'Gran Burdock’s Rest: Ostara’s pail', stage(GRAN, 'pail'),
    'Where Gran’s roots end, at the foot of the Twelve Stairs, a sap-pail stands on the black ground, half full of warm green sap. Its handle is tied with a ribbon in a lovely bow. The label says, in sticky green ink: “For Gran. She’s always thirsty, poor lamb. Back tomorrow. O.”', 'hedgewitch.gran_pail',
    'The foot of the Twelve Stairs. There is a ring of green on the black ground where a pail stood.', 'Every night Ostara has carried a pail down the Stairs and through the Legion to keep one old woman green. Even here. Even now. You pick it up. It is still warm.'),

  // ======================= ACT III, Thistledown’s Answer: the right nothing
  ...[
    'Thistledown inspects a bare patch of black ground behind the cook-tent, very thoroughly, from several angles. “No,” it says at last. “Somebody has dropped porridge here. Porridge is something. I am not for growing where porridge has.”',
    'Thistledown inspects a crack beside the tethering-posts. It lies down to look at it more closely. “No. There is a beetle in here. It got here first. It would be rude.”',
    'Thistledown inspects the black ground at the very edge of the camp, where the Legion road begins and nothing has ever grown, not once, not even in a crack. It goes very still. “Oh,” it says. “Oh. This is the most nothing I have ever seen.”',
  ].map((text, i): DialogueDef => clue(`hedgewitch-thistle-spot-${i + 1}`, `Thistledown’s Answer: a patch of nothing (${i + 1})`, stage(THISTLE, 'spots'),
    text, `hedgewitch.thistle_spot_${i + 1}`, 'A patch of black ground at the Heart camp. Thistledown has inspected it.')),
];

export default dialogues;
