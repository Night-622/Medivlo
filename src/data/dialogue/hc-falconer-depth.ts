/**
 * Hollow Crown, FALCONER Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const WR = 'npc:old-wren' as const, AC = 'npc:amos-coyle' as const, HP = 'npc:hamo-pickering' as const;
const SJ = 'npc:swithun-jessop' as const, ED = 'npc:elias-downe' as const;

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

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Bell over the Moor: the top of the cliffs
  {
    id: 'dialogue:area-falconer-cliff-stair', name: 'I-1 banter: up the cliff stair', bark: true,
    entries: [{ when: stage('quest:falconer-the-bell-over-the-moor', 'clifftop'), node: 'b' }],
    nodes: { b: { speaker: WR, text: '(Her voice, from far below, carried up on the wind.) Left foot, right foot. The ninth step is loose. The ninth step has been loose since my grandmother.', next: null } },
  },
  {
    id: 'dialogue:falconer-cliff-top', name: 'I-1 the top of the Mews Cliffs', scope: 'party',
    entries: [{ node: 'top' }],
    nodes: {
      top: { speaker: 'narrator', text: 'From the top of the Mews Cliffs the whole Hawkmoor lies under the moon, and on the highest hill, far off, the Moor’s Crown is moving. Ten thousand birds have settled round its ring of stones and are wheeling over it, slowly, like a whirlpool of wings.', next: 'hawk' },
      hawk: {
        speaker: 'narrator', text: 'Your hawk leans towards it on your fist, and so does the thing under your ribs. The note caught in its feathers is still ringing, so faintly that you could mistake it for the wind.',
        choices: [
          { text: '(Cast the hawk, and call it straight back.)', to: 'test' },
          { text: '(Count them from the turn of the wheel, the way the Mews counts a cast.)', to: 'count', school: 'hunt' },
          { text: '(Just watch.)', to: 'watch' },
        ],
      },
      test: { speaker: 'narrator', text: 'It goes and comes back, twice, quicker each time, as if to show you that it can. Whatever is on the Crown, it is not keeping your bird.', next: 'dawn' },
      count: { speaker: 'narrator', text: 'You lose count at four thousand. They fly one way round the hill, every one, hooded and free, and not one of them lands inside the ring of stones. They are guarding it, or waiting.', next: 'dawn' },
      watch: { speaker: 'narrator', text: 'You watch until your fingers are cold. Nobody on the cliffs has ever seen birds do this. Nobody on the cliffs has ever seen ten thousand birds in one place, come to that.', next: 'dawn' },
      dawn: { speaker: 'narrator', text: 'Near dawn the wheel breaks apart all at once, and the birds stream home over the moor to their perches in long grey ribbons. Not all of them. Far fewer than went.', next: null },
    },
  },

  // ======================= I-2 The Falling Birds: the line of fallen feathers
  {
    id: 'dialogue:area-falconer-featherfall-rim', name: 'I-2 banter: the Featherfall rim', bark: true,
    entries: [{ when: stage('quest:falconer-the-falling-birds', 'trail'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The heather thins and the ground falls away into grey. Even from up here the Featherfall is quiet in a way the moor never is: no larks, no wind in the grass, only feathers coming down.', next: null } },
  },
  clue('falconer-fall-feather-1', 'I-2 the fallen feathers (1)', stage('quest:falconer-the-falling-birds', 'trail'),
    'A flight feather from a wild hawk, lying in the heather, black along the vane where a tear dried on it. The black has run the way the bird was falling: downhill, towards the Featherfall.', 'falconer.fall_1',
    'Heather, and a single feather caught in it.'),
  clue('falconer-fall-feather-2', 'I-2 the fallen feathers (2)', stage('quest:falconer-the-falling-birds', 'trail'),
    'A merlin, dead in the heather with its wings spread as if it were still trying. The black is in its eyes and nowhere else. It fell straight down without turning, the way a bird falls when it cannot see the ground.', 'falconer.fall_2',
    'A small cairn of stones in the heather.'),
  clue('falconer-fall-feather-3', 'I-2 the fallen feathers (3)', stage('quest:falconer-the-falling-birds', 'trail'),
    'At the rim of the Featherfall, a peregrine with a hood on. Not a Mews hood: soft leather, beautifully stitched, damp all through. Somebody hooded a wild bird out on the moor and let it go, and it flew blind until it fell.', 'falconer.fall_hood',
    'The rim of the Featherfall, and the grey below.', 'Nobody on the Mews Cliffs hoods a wild bird. Nobody on the Mews Cliffs makes a hood that fine.'),

  // ======================= I-3 The Bear Cave: Shepherd Coyle saw it go
  {
    id: 'dialogue:falconer-coyle-bear', name: 'I-3 Coyle on the bear', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: AC, text: 'The bear? Came down the hill at first light and ate my gate. Not the sheep. The gate. Then it stood in the fold and ate the hurdles, one after another, crying the whole time.', next: 'wimble' },
      wimble: {
        speaker: AC, text: 'Wimble stood in front of the ewes and barked at it, and it went round her. Round a dog the size of a cushion. I’ve never once seen a bear go round anything.',
        choices: [
          { text: 'Which way did it go?', to: 'way' },
          { text: 'It wasn’t afraid of her. It was afraid of whatever she keeps off.', to: 'keeps', school: 'hunt' },
        ],
      },
      way: { speaker: AC, text: 'Up to the big tor with the cave under it, where the young hawks used to mob it, summers. It’s gone home. Things go home when they’re sick.', next: 'end' },
      keeps: { speaker: AC, text: '(He looks at Wimble, and Wimble looks back.) …Is that what she does up the tor of an evening? Well. It went up to the cave under the big tor, anyway. Things go home when they’re sick.', next: 'end' },
      end: { speaker: AC, mood: 'sad', text: 'Mind yourself, and mind your hawk. It was crying, that bear. I didn’t know they could.', choices: more(offer('quest:falconer-shepherd-coyles-dog', 'Is that a fold full of hawks behind you?', 'hawks')) },
      hawks: { speaker: AC, text: 'Nineteen of them. Wimble brings them in off the moor and pens them, and they let her. You’re a falconer. Look at them, and tell me I’m not going mad.', next: null },
    },
  },

  // ======================= I-4 The Gentle Stranger: the hooded birds on the perches
  clue('falconer-hooded-bird-1', 'I-4 a hooded bird (1)', stage('quest:falconer-the-gentle-stranger', 'perches'),
    'A gyrfalcon, hooded in soft black leather, sitting on its perch as still as a carving. It does not rouse when you whistle. Its feet are gripping the perch so hard that the wood has split.', 'falconer.hooded_1',
    'A perch on the cliffs, with a bird on it, very still.'),
  clue('falconer-hooded-bird-2', 'I-4 a hooded bird (2)', stage('quest:falconer-the-gentle-stranger', 'perches'),
    'A young goshawk, hooded, its supper untouched on the block beside it. A hooded bird is meant to feed after a while. This one seems to have forgotten that food is a thing it wants.', 'falconer.hooded_2',
    'A perch with an untouched supper beside it.'),
  clue('falconer-hooded-bird-3', 'I-4 a hooded bird (3)', stage('quest:falconer-the-gentle-stranger', 'perches'),
    'A kestrel, hooded, with a single bead of black creeping out from under the leather and down its cheek. Calm is not the same as well. Under the hood, something is still weeping.', 'falconer.hood_tear',
    'A perch with a kestrel on it, hooded.'),

  // ======================= I-5 The Hooding: canvassing the envoy and the post-keeper
  {
    id: 'dialogue:falconer-pickering-canvass', name: 'I-5 Hamo Pickering on the vote', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HP, text: '(He is holding onto a rock.) The vote? Oh, I’m not supposed to lobby. Master Bannock was very clear. He said, Hamo, don’t lobby, ask nicely. So. Please lend us your hawks.',
        choices: [
          { text: 'What would the Lodge do with them?', to: 'do' },
          { text: 'What happens to the birds?', to: 'birds' },
        ],
      },
      do: { speaker: HP, text: 'Fly them over the Elkway. A hawk can see a hollow elk a mile off, before it charges. We’re losing hunters, falconer. Last month we lost three, and a cart, and a very good hat.', next: 'end' },
      birds: { speaker: HP, mood: 'sad', text: 'Honestly? Some won’t come back. The herd is sick, and sick things kick. Master Bannock says count what you leave as well as what you take, and I would. I’d count every one.', next: 'end' },
      end: { speaker: HP, text: 'Vote how you like. If it’s no, I’ll go home and say I asked nicely. Is there a way down that isn’t that path? No? Right.', next: null },
    },
  },
  {
    id: 'dialogue:falconer-swithun-canvass', name: 'I-5 Swithun on the vote', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: SJ, text: 'My post-hawks. (He nods at a row of them, hooded on their perches, very still.) He did them last night. Kindly, mind. They haven’t flown since, and they haven’t eaten. But not one of them has fallen.',
        choices: [
          { text: 'So the hood works.', to: 'works' },
          { text: 'Would you take the hoods off?', to: 'off' },
        ],
      },
      works: { speaker: SJ, text: 'It works the way a locked door works. Nothing gets in. Nothing gets out, either. Three steadings have had no letters this week. I don’t know what that’s worth against a dead bird.', next: 'end' },
      off: { speaker: SJ, mood: 'sad', text: 'I tried. They didn’t want me to. That’s what frightens me. A bird that wants its hood on.', next: 'end' },
      end: { speaker: SJ, text: 'Vote with your eyes open, falconer. That’s all I’d ask. Somebody up there ought to.', choices: more(offer('quest:falconer-the-moorland-post', 'Could I fly your post round for you?', 'round')) },
      round: { speaker: SJ, text: 'Would you? Three steadings waiting on letters. Your bird’s still got its eyes.', next: null },
    },
  },

  // ======================= I-6 Grandmother Talon: Elias at the foot of the Eyrie
  {
    id: 'dialogue:falconer-elias-eyrie', name: 'I-6 Elias and the way up', scope: 'party',
    entries: [
      { when: { flag: 'falconer.hooding', value: 'hooded' }, node: 'hooded' },
      { when: { flag: 'falconer.hooding', value: 'lent' }, node: 'lent' },
      { node: 'free' },
    ],
    nodes: {
      hooded: { speaker: ED, mood: 'sad', text: 'They walk past my cairn all night now, the hooded ones. On foot, in a line. I named the first forty and then I couldn’t keep up. A bird shouldn’t walk past you. It isn’t dignified.', next: 'way' },
      lent: { speaker: ED, text: 'The Lodge’s borrowed hawks have been drifting back over the Featherfall all morning, off course, towards the Eyrie, as if somebody had them on a line. The Huntsmen below are waving their hats at them.', next: 'way' },
      free: { speaker: ED, text: 'The free birds won’t go near it. They circle the Eyrie and cry, keeping well off. First time in thirty years I’ve seen a bird decide not to go somewhere.', next: 'way' },
      way: {
        speaker: ED, text: 'Up the cliff, then. There’s a goat path behind the thorn trees, and then there isn’t, and then you climb. (He looks up.) She’s calling them home, Grandmother Talon. She’s the oldest thing on the moor. Older than me.',
        choices: [
          { text: 'Have you named her?', to: 'name' },
          { text: 'I’ll go up.', to: 'end' },
        ],
      },
      name: { speaker: ED, mood: 'sad', text: 'No. You don’t name a living bird, only the fallen. (A pause.) I should hate to have to name her.', next: 'end' },
      end: {
        speaker: ED, text: 'Mind the third ledge. Everything falls off the third ledge. I’ve named half of it.',
        choices: more(
          offer('quest:falconer-the-feather-counter', 'Do you need help with the count?', 'count'),
          offer('quest:falconer-fledglings', 'Whose nest is that in the thorn tree?', 'nest'),
        ),
      },
      count: { speaker: ED, text: 'Bless you. Three fell this morning and my knees fell with them. Find them and look at them properly, and bring me their names.', next: null },
      nest: { speaker: ED, mood: 'sad', text: 'Four fledglings, and not a tear on them. Their mother fell last week. They need raising by somebody who can fly. Don’t hood them, whatever you do.', next: null },
    },
  },

  // ======================= I-7 What the Hood Holds: Teodor’s bunk in the old mews
  {
    id: 'dialogue:obj-falconer-teodor-bunk', name: 'I-7 Teodor’s bunk', scope: 'party',
    entries: [{ when: stage('quest:falconer-what-the-hood-holds', 'bunk'), node: 'bunk' }, { node: 'plain' }],
    nodes: {
      bunk: { speaker: 'narrator', text: 'Teodor’s bunk in the old mews is made, the blanket squared, a hood-maker’s last on the shelf above it with a half-finished hood still on it. Pinned to the wall by the pillow is a sheet of paper in a child’s round hand: THINGS I AM FRIGHTENED OF.', next: 'list' },
      list: {
        speaker: 'narrator', text: 'The wind. The dark. The birds. Being looked at. Being picked last. Wren being disappointed. The list goes all the way down the page in different inks, added to for years.',
        choices: [
          { text: '(Read to the bottom.)', to: 'bottom' },
          { text: '(Look at the half-finished hood on the last.)', to: 'last', school: 'hunt' },
        ],
      },
      last: { speaker: 'narrator', text: 'It is the first hood he ever made, by the stitching: clumsy, too big, lined with soft lambswool so that it would not hurt. He did not make it for a bird. It is the size of a boy’s head.', next: 'bottom' },
      bottom: { speaker: 'narrator', text: 'At the very bottom, in older, steadier writing, there is a second list, one line long. NOT FRIGHTENED OF. And under it: Wren.', effects: [{ setFlag: 'falconer.teodor_list', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Teodor’s bunk in the old mews, made, and cold.', next: null },
    },
  },

  // ======================= I-9 Cut Jesses: the Leaving Post on the gate road
  {
    id: 'dialogue:area-falconer-gate-road', name: 'I-9 banter: down the gate road', bark: true,
    entries: [{ when: stage('quest:falconer-cut-jesses', 'post'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The heather gives way to the gate road, and on every tor you pass a bird turns its head to watch you go, the way the Mews watches a falconer leave.', next: null } },
  },
  {
    id: 'dialogue:obj-falconer-leaving-post', name: 'I-9 the Leaving Post', scope: 'party',
    entries: [{ when: stage('quest:falconer-cut-jesses', 'post'), node: 'post' }, { node: 'plain' }],
    nodes: {
      post: { speaker: 'narrator', text: 'The Leaving Post is an old larch pole by the gate road, so thick with cut jesses that it looks feathered: thousands of them, in every colour leather comes in, knotted on by every falconer who ever left the Mews to fly somewhere else.', next: 'jess' },
      jess: {
        speaker: 'narrator', text: 'Near the top, newer than the rest but twelve years weathered, one jess hangs by a single thread, cut and never knotted, stitched T.T. Somebody stood here meaning to leave, and could not finish it.',
        choices: [
          { text: '(Cut a jess of your own and tie it on with Odile’s knot.)', to: 'knot', when: { flag: 'falconer.odile_knot' }, effects: [{ unlockLore: 'lore:hc-falconer-leaving-post' }] },
          { text: '(Cut a jess and knot it on.)', to: 'tie', effects: [{ unlockLore: 'lore:hc-falconer-leaving-post' }] },
          { text: '(Knot Teodor’s jess on properly, beside your own.)', to: 'his', school: 'hunt', effects: [{ unlockLore: 'lore:hc-falconer-leaving-post' }] },
        ],
      },
      knot: { speaker: 'narrator', text: 'You tie it with the falconer’s knot, the one that holds until something truly pulls. The post creaks in the wind: a thousand years of leaving, every one of them a coming back that has not happened yet.', next: null },
      tie: { speaker: 'narrator', text: 'You knot it on among the thousands. The wind lifts it at once, the way it lifts all the rest, and points it up the road towards the gate.', next: null },
      his: { speaker: 'narrator', text: 'You knot his on beside yours, firmly. Whatever he meant to do here, the post will hold it for him now. That is what it is for.', next: null },
      plain: { speaker: 'narrator', text: 'The Leaving Post on the gate road, feathered with jesses.', next: null },
    },
  },

  // ======================= Side: Pibb Won’t Come Down (the view from the new perch)
  {
    id: 'dialogue:obj-falconer-new-perch', name: 'Pibb Won’t Come Down: the new perch-ledge', scope: 'party',
    entries: [{ when: stage('quest:falconer-pibb-wont-come-down', 'perch'), node: 'perch' }, { node: 'plain' }],
    nodes: {
      perch: {
        speaker: 'narrator', text: 'The new perch-ledge is good oak, as Wren said, and Pibb would not have minded the wood at all. What he minds is the view. From the new ledge you look straight out over the Featherfall, where the black hangs in the air like soot on a window.',
        choices: [
          { text: '(Turn the perch to face the sea cliffs instead.)', to: 'turn', trust: 1, trustNpc: WR },
          { text: '(Crouch on it yourself, the way a kestrel would, and look.)', to: 'sit', school: 'hunt' },
        ],
      },
      sit: { speaker: 'narrator', text: 'You crouch on the ledge with your eyes half shut and look out the way a kestrel looks. Even you can feel it: a wrongness over the Featherfall, like a draught from a door left open. You would not sit here either.', next: 'turn' },
      turn: { speaker: 'narrator', text: 'You unpeg the ledge and set it again facing the sea, where the wind is clean. Pibb drops onto it at once, fluffs up and shuts his eyes. On her ledge, Wren laughs. “Oh, you clever bird. It was never the wood, was it.”', effects: [{ setFlag: 'falconer.perch_turned', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The new perch-ledge, facing the sea, with a kestrel asleep on it.', next: null },
    },
  },

  // ======================= Side: the Jess-Maker’s Knots (the knot on a hooded bird)
  {
    id: 'dialogue:obj-falconer-post-hawk', name: 'The Jess-Maker’s Knots: the knot on a hooded hawk', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-jess-makers-knots', 'hawk'), node: 'hawk' }, { node: 'plain' }],
    nodes: {
      hawk: { speaker: 'narrator', text: 'One of Swithun’s post-hawks, hooded on its perch in the loft, gripping hard. You take off its old jess and tie on a new one with Odile’s knot: fast against every tug, open only to a true pull.', next: 'wait' },
      wait: {
        speaker: 'narrator', text: 'For a long time nothing happens. Then the hawk leans, and pulls once, as if it had remembered something. The knot opens like a hand. The hawk shakes its head, hard, and the soft hood slips off and falls into the straw.',
        choices: [
          { text: '(Keep still and let it look at you.)', to: 'look' },
          { text: '(Pick up the hood.)', to: 'hood' },
        ],
      },
      look: { speaker: 'narrator', text: 'It looks at you, and at the loft, and at the sky through the door. Then it hops onto the door-sill and sits there in the wind, blinking, frightened and seeing. Swithun, at the ladder, says a word he would not want the Mews to hear.', next: null },
      hood: { speaker: 'narrator', text: 'The hood is wet on the inside. Behind you the hawk hops to the door-sill and sits in the wind, frightened and blinking and seeing everything. It does not want the hood back. It never did.', next: null },
      plain: { speaker: 'narrator', text: 'Swithun’s loft. One perch has no hood on it.', next: null },
    },
  },

  // ======================= Side: Shepherd Coyle’s Dog (what Wimble barks at)
  {
    id: 'dialogue:obj-falconer-wimble-tor', name: 'Shepherd Coyle’s Dog: Wimble on the tor', scope: 'party',
    entries: [{ when: stage('quest:falconer-shepherd-coyles-dog', 'tor'), node: 'tor' }, { node: 'plain' }],
    nodes: {
      tor: {
        speaker: 'narrator', text: 'On the top of the tor behind the steading Wimble is standing four-square in the heather, barking at the ground. Where she is barking, black is seeping up out of the peat like water out of a sponge: a spring of tears, on the open moor.',
        choices: [
          { text: '(Cut turf and lay it over the seep, the way the Mews covers a spoiled nest.)', to: 'turf', school: 'hunt', effects: [{ setFlag: 'falconer.seep_found', value: 'covered' }] },
          { text: '(Build a cairn round it, so the shepherds know.)', to: 'cairn', effects: [{ setFlag: 'falconer.seep_found', value: 'marked' }] },
          { text: '(Call Wimble off, and go and tell Coyle.)', to: 'tell', effects: [{ setFlag: 'falconer.seep_found', value: 'told' }] },
        ],
      },
      turf: { speaker: 'narrator', text: 'You cut three turves with your knife and lay them over it, green side up. The black comes up through the first and stops at the second. Wimble stops barking, sniffs it, and sits down on it, very firmly.', next: null },
      cairn: { speaker: 'narrator', text: 'You pile stones round it, a cairn the height of a dog. Wimble watches the whole time, then trots once round it, satisfied, as if she had told you to do exactly that.', next: null },
      tell: { speaker: 'narrator', text: 'Wimble comes when you call, eventually, after one last bark at the seep. Coyle will want to know his dog has been holding back the tears single-handed, every evening, for a month.', next: null },
      plain: { speaker: 'narrator', text: 'The top of the tor behind Coyle’s steading.', next: null },
    },
  },

  // ======================= Side: Bones of the Herd (the two that turned back)
  {
    id: 'dialogue:obj-falconer-turned-bones', name: 'Bones of the Herd: the bones that face home', scope: 'party',
    entries: [{ when: stage('quest:falconer-bones-of-the-herd', 'turned'), node: 'bones' }, { node: 'plain' }],
    nodes: {
      bones: { speaker: 'narrator', text: 'At the far edge of the last drift, a little apart, lies the skeleton of a yearling calf. Every other skull on the plain faces the gate. This one faces home, towards the Hawkmoor, and its small neck is curled round the antler of a great stag lying beside it.', next: 'stag' },
      stag: {
        speaker: 'narrator', text: 'The stag’s bones point at the gate like all the rest. But it stopped. It came back for the calf, the only one on the whole plain that turned, and lay down beside it.',
        choices: [
          { text: '(Read how they fell.)', to: 'read', school: 'hunt' },
          { text: '(Lay a stone between them.)', to: 'stone' },
        ],
      },
      read: { speaker: 'narrator', text: 'The frost-cracks say they died on the same night as the rest, but later, slowly, side by side. Not running. Waiting. Somebody, the stag must have thought, would come and lead them home.', next: 'stone' },
      stone: { speaker: 'narrator', text: 'You set a flat stone between the two skulls, the way the Lodge marks a place where something was given rather than taken.', effects: [{ setFlag: 'falconer.turned_back', value: true }, { unlockLore: 'lore:hc-falconer-turned-back' }], next: null },
      plain: { speaker: 'narrator', text: 'Two skulls on the Windscour, a great one and a small one, with a flat stone between them.', next: null },
    },
  },

  // ======================= Side: the Feather-Counter (the ring-book)
  {
    id: 'dialogue:falconer-swithun-ring', name: 'The Feather-Counter: the ring-book', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: SJ, text: 'A Cliffstair ring? (He hauls down a ring-book as thick as a doorstep and licks his thumb.) The Mews never rang anything at Cliffstair. But we lent birds to the Turning fair, every Turning. Let me see. C. 1011…', next: 'found' },
      found: {
        speaker: 'narrator', text: 'In the ring-book for C. 1011, in his father’s hand: “Grey falcon, Merrow, lent to the Cliffstair falconers for the Turning fair. Rung there. To come home after.” Beside it, nothing, for thirty years.',
        choices: [
          { text: 'She came home.', to: 'home' },
          { text: 'Thirty years to get back.', to: 'years' },
        ],
      },
      home: { speaker: SJ, mood: 'sad', text: 'She came home. Over a shut gate, or round it, or through it, I don’t know how. (He dips his pen and writes beside the entry: “Home. C. 1042.”) Elias can call her Wanderer if he likes. Her name was Merrow.', next: null },
      years: { speaker: SJ, text: 'Thirty years, and she fell in the Featherfall half a day from her own perch. (He writes beside the entry: “Home. C. 1042.”) Tell Elias her name was Merrow. He can keep Wanderer too. She earned two.', next: null },
    },
  },

  // ======================= Side: Fledglings (names for the living)
  {
    id: 'dialogue:falconer-elias-names', name: 'Fledglings: names for the living', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: ED, mood: 'happy', text: 'Flown? All four? (He shades his eyes and finds them: four untidy shapes over the Featherfall, shrieking.) Oh. Oh, look at them. Not a hood among them.', next: 'names' },
      names: {
        speaker: ED, text: 'Eleven thousand birds I’ve named, and every one of them was lying in the heather. I’ve never named a bird that was flying. I don’t know if I’m allowed.',
        choices: [
          { text: 'You’re allowed. Name them.', to: 'elias', trust: 1, effects: [{ setFlag: 'falconer.fledglings_named', value: 'elias' }] },
          { text: 'Let them name themselves. Watch how they fly, and you’ll know.', to: 'watch', school: 'hunt', effects: [{ setFlag: 'falconer.fledglings_named', value: 'flown' }] },
          { text: 'Some birds shouldn’t have names. These ones are free.', to: 'free', effects: [{ setFlag: 'falconer.fledglings_named', value: 'none' }] },
        ],
      },
      elias: { speaker: ED, mood: 'happy', text: '(He watches them a long while, his lips moving.) Margery, for their mother. Bramble. Bracken. And the little one is Last, because she’s always last, and because she won’t be.', next: null },
      watch: { speaker: ED, mood: 'happy', text: '(You watch together. One flies straight, one loops, one shrieks, one follows the others.) Arrow, Loop, Shout and Follow. There. They named themselves. That’s the best kind.', next: null },
      free: { speaker: ED, text: '(He thinks about it.) Yes. Yes, you’re right. I’ll count them, though. I’m allowed to count. Four. Four, flying. That’s the best number I’ve written down in thirty years.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in the Hawkmoor ruin, cave and viewpoint
  {
    id: 'dialogue:obj-hunt-frontier-ruin-find', name: 'Hawkmoor ruin: the tower with no door', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A round tower on the moor, roofless, its walls pocked with a thousand nest-holes. There was never a door, only a gap. Over the gap, carved in the old Mews hand: “A bird that comes back was never kept.”', effects: [{ unlockLore: 'lore:hc-hunt-frontier-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-hunt-frontier-cave-find', name: 'Hawkmoor cave: the calls on the walls', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'The wind blows through this cave in long, low notes, and the walls are cut with falconers’ calls, notch and line, thousands of them. Low down, in Wren’s hand, is a call you know at once: yours, cut for you when you were too small to reach.', effects: [{ unlockLore: 'lore:hc-hunt-frontier-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-hunt-frontier-cave-codex', name: 'The Calling Cave: a call cut six times', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'In a side passage, one call has been cut deep into the rock, then scratched out, then cut again beside the scratches, smaller, then scratched out again. Six times. Under the last, in a boy’s hand: “T.T. Wren says it is a good call. I am not sure it is mine.”', effects: [{ unlockLore: 'lore:hc-hunt-frontier-call' }], next: null } },
  },
  {
    id: 'dialogue:obj-hunt-frontier-view-find', name: 'Hawkmoor viewpoint: the Hawk’s Seat', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A stone seat on the highest tor, worn into a hollow by a thousand years of falconers waiting for their birds. From it you can see the whole Hawkmoor, the grey bowl of the Featherfall and the ring on the Moor’s Crown, very small. Cut into the arm: “Watch the sky. It watches back.”', effects: [{ unlockLore: 'lore:hc-hunt-frontier-view' }], next: null } },
  },
  // ======================= ACT II, C-1 The Cormorant Boats: the perches on the mud-bank
  {
    id: 'dialogue:obj-falconer-cormorant-perches', name: 'C-1 the cormorant perches', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-cormorant-boats', 'perches'), node: 'oars' }, { node: 'plain' }],
    nodes: {
      oars: { speaker: 'narrator', text: 'A row of old oars driven into the mud-bank below the ferry, each one topped with a crosspiece and a cormorant, drying its wings like washing. No hoods. No jesses. Each bird has a copper ring on one leg, stamped the Mews way.', next: 'rings' },
      rings: {
        speaker: 'npc:prudence-gannet', text: '(Coming up behind you with a bucket of sprats.) Read them. Go on. That’s the eyrie each one would have gone home to, if we’d ever got home. We stamp the chicks too. Thirty years of birds ringed for a cliff they’ve never seen.',
        choices: [
          { text: 'Why keep ringing them for the Mews?', to: 'why' },
          { text: 'I can take a ring home, if you like. To the eyrie it names.', to: 'take', trust: 1, trustNpc: 'npc:prudence-gannet', effects: [{ setFlag: 'falconer.prudence_ring', value: true }] },
        ],
      },
      why: { speaker: 'npc:prudence-gannet', mood: 'sad', text: 'Because a ring’s a promise to the bird, not to us. You tell it where home is, so if it ever has to go, it knows. (She throws a sprat; a cormorant takes it without moving its wings.) They’ve never needed to. That’s not the point.', next: 'end' },
      take: { speaker: 'npc:prudence-gannet', mood: 'happy', text: '(She looks at you a long while, then twists a ring off the oldest perch, an empty one.) That was Sooty’s. Ledge Nine, the Spurling eyrie. Hang it on the eyrie wall for him. He’d have liked to see it. He liked a view.', next: 'end' },
      end: { speaker: 'npc:prudence-gannet', text: 'Now. The Stag. Go and listen to the Gloamwood from above. Where nothing sings, it has wept.', next: null },
      plain: { speaker: 'narrator', text: 'A row of cormorant perches made of old oars, on the mud-bank under the ferry.', next: null },
    },
  },

  // ======================= ACT II, C-2 The Silent Canopy: the abandoned nest
  {
    id: 'dialogue:obj-falconer-silent-nest', name: 'C-2 the nest at the edge of the silence', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-silent-canopy', 'nest'), node: 'nest' }, { node: 'plain' }],
    nodes: {
      nest: { speaker: 'narrator', text: 'Low in a holly at the edge of the silent road, a song-thrush’s nest, beautifully made, plastered smooth inside with mud. Four blue eggs. Three are stone cold. The parents left all at once, the way birds leave a place that has gone wrong.', next: 'egg' },
      egg: {
        speaker: 'narrator', text: 'The fourth egg, when you touch it, is still faintly warm. Something inside it is still trying.',
        choices: [
          { text: '(Fold it into your glove, against your wrist, and carry it.)', to: 'carry', effects: [{ setFlag: 'falconer.thrush_egg', value: true }] },
          { text: '(Leave it. It has to be the wood’s to keep.)', to: 'leave' },
        ],
      },
      carry: { speaker: 'narrator', text: 'You tuck it into the fist of your glove. Your hawk looks at it with an expression you would rather not interpret, and decides, on reflection, to be above it. By the deep glade the egg has a tap in it. By the time you come out, it will have a beak.', next: null },
      leave: { speaker: 'narrator', text: 'You leave it, and step back. Ahead of you the silent road runs into the dark under the trees, and you understand, now, what the birds understood: whatever is weeping at the end of it is so sad that nothing can bear to sing near it.', next: null },
      plain: { speaker: 'narrator', text: 'A thrush’s nest in a holly, at the edge of the Gloamwood’s silence.', next: null },
    },
  },

  // ======================= ACT II, C-3 The White Stag: telling Prudence
  {
    id: 'dialogue:falconer-prudence-stag', name: 'C-3 Prudence hears the Stag is at rest', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:prudence-gannet', text: '(In her boat under the ferry, with every cormorant along the gunwale facing the same way, towards the wood.) They turned round an hour ago, all at once, and they’ve been looking that way ever since. Then the Wend started to sing. Tell me.', next: 'tell' },
      tell: {
        speaker: 'narrator', text: 'You tell her: the silence, the deep glade, the Stag kneeling, the mark. And the first thrush that started up over your head as you walked back out, very loud, as if it had been holding it in.',
        choices: [
          { text: 'It looked at the sky at the end. Not at me.', to: 'sky' },
          { text: 'I brought this out of the silence.', to: 'egg', when: { flag: 'falconer.thrush_egg' } },
        ],
      },
      sky: { speaker: 'npc:prudence-gannet', mood: 'sad', text: 'Course it did. It walked ahead of the crown a thousand years, with the birds going over. That’s what it missed. Not the crown. The birds. (She wipes her nose on her oilskin.) Damp out here.', next: 'end' },
      egg: { speaker: 'npc:prudence-gannet', mood: 'happy', text: '(You open your glove. A thrush chick the size of a walnut opens its beak at her and shrieks.) Oh, look at you. Look at the mouth on it. (She takes it in her two great hands.) I’ll raise it. I’ve raised worse. I raised Sooty.', next: 'end' },
      end: { speaker: 'npc:prudence-gannet', text: 'There’s talk on the river from Cliffstair. The Stormcrow’s gone quiet, and a man in a hood was seen climbing to it. You’ll want Bartle Crisp at the Lightning Jar. He sees everything that goes up that cliff.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Hooded Crow: up the cliff with Bartle
  {
    id: 'dialogue:area-falconer-cliff-path', name: 'C-4 banter: Bartle on the cliff path', bark: true,
    entries: [{ when: { any: [stage('quest:falconer-the-hooded-crow', 'escort'), stage('quest:falconer-the-hooded-crow', 'regroup')] }, node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Bartle climbs the cliff path with his lantern in one hand and the fish on its board in the other, puffing. “Thirty years,” he says to the hooded gulls on the ledges as he passes them. “Thirty years, and not one of you has ever once said thank you.” None of them says anything now.', next: null } },
  },
  {
    id: 'dialogue:falconer-bartle-ledge', name: 'C-4 Bartle at the supper ledge', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:bartle-crisp', text: '(He sets the fish down on the flat rock of the supper ledge, squares the board, and stands back.) There. Every Turning night since my grandad’s time. The crow comes down, takes the fish, screams the news. Thirty years it’s screamed the same news. Turning’s coming. Turning’s coming.', next: 'up' },
      up: {
        speaker: 'npc:bartle-crisp', mood: 'sad', text: 'Look at them up there. Every bird on the cliff with a sack on its head, and him at the top pulling the big one tighter. He told me over his soup he was doing it a kindness. So it wouldn’t have to keep shouting about something that was never coming.',
        choices: [
          { text: 'Is he wrong?', to: 'wrong' },
          { text: 'You kept bringing it supper. Thirty years. For news that never came.', to: 'kept', trust: 1, trustNpc: 'npc:bartle-crisp' },
        ],
      },
      wrong: { speaker: 'npc:bartle-crisp', text: 'Don’t know. Maybe it’s the kindest thing anyone ever did for it. (He looks up at the hood, screaming.) But it’s still screaming, isn’t it. Under there. It just can’t see what at.', next: 'end' },
      kept: { speaker: 'npc:bartle-crisp', mood: 'happy', text: 'Well, somebody had to. (He laughs, embarrassed.) My customers think I’m mad. My customers drink to it every night. That crow’s been the only thing on this cliff that believed the Turning was coming. I wasn’t going to let it go hungry for it.', next: 'end' },
      end: { speaker: 'npc:bartle-crisp', text: 'Go on up. I’ll wait here with the fish. Mind the next ledge, and when you get to the top, take that sack off its head. It ought to see what it’s shouting at, even if it’s nothing.', next: null },
    },
  },

  // ======================= ACT II, C-5 The Stormcrow: the great hood
  {
    id: 'dialogue:obj-falconer-great-hood', name: 'C-5 the great hood in the Stormcrow’s nest', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-stormcrow', 'hood'), node: 'hood' }, { node: 'plain' }],
    nodes: {
      hood: { speaker: 'narrator', text: 'The great hood lies on the rocks of the nest, big enough to cover a cart, sewn of black tears and Mews leather. The stitching is the finest you have ever seen: tight, even, tender. The lining is quilted, so it would not chafe. It is the work of somebody who loves birds.', next: 'lining' },
      lining: {
        speaker: 'narrator', text: 'Inside the lining, stitched in small careful letters round the eye-pieces, the way the Mews mark a bird’s first hood: “So you won’t be frightened. T.”',
        choices: [
          { text: '(Cut the lining out and keep it.)', to: 'keep', effects: [{ setFlag: 'falconer.hood_lining', value: true }] },
          { text: '(Throw the whole hood off the cliff.)', to: 'throw' },
        ],
      },
      keep: { speaker: 'narrator', text: 'You cut the lining out with your knife, and fold it, and put it in your pack. When you see him again you will have something to give him that is his, and true, and not the hood.', next: null },
      throw: { speaker: 'narrator', text: 'You heave it over the edge. It goes down the Stormcliffs end over end, catching on nothing, and the sea takes it without a sound. Far below, on the cliff path, the gulls on the ledges begin, one by one, to shake their own hoods off.', next: null },
      plain: { speaker: 'narrator', text: 'The Stormcrow’s nest at the top of the cliffs, open to the sky.', next: null },
    },
  },

  // ======================= ACT II, C-6 Wren’s Letter: the reply
  {
    id: 'dialogue:obj-falconer-reply-to-wren', name: 'C-6 a reply for Wren', scope: 'party',
    entries: [
      { when: { all: [stage('quest:falconer-wrens-letter', 'reply'), { flag: 'falconer.pibb_pet' }] }, node: 'plumley' },
      { when: stage('quest:falconer-wrens-letter', 'reply'), node: 'pibb' },
      { node: 'plain' },
    ],
    nodes: {
      pibb: { speaker: 'narrator', text: 'Pibb is on the dovecote roof behind the inn, among the pigeons, who are giving him a great deal of room. He holds out a foot. He is looking at you hard, which means Wren is looking too. Whatever you write, she will see you write it.', next: 'write' },
      plumley: { speaker: 'narrator', text: 'Captain Plumley is on the dovecote roof behind the inn, explaining himself to the local pigeons, who are not interested. He holds out a foot with tremendous dignity. On your shoulder, Pibb looks the other way.', next: 'write' },
      write: {
        speaker: 'narrator', text: 'A scrap of paper, the size of a feather. What do you send the Mews?',
        choices: [
          { text: '“Stag at rest. Crow unhooded. Boots mended. Fly well.”', to: 'sent', effects: [{ setFlag: 'falconer.reply', value: 'boots' }] },
          { text: '“Prudence Gannet sends Sooty’s ring home to Ledge Nine.”', to: 'sent', when: { flag: 'falconer.prudence_ring' }, effects: [{ setFlag: 'falconer.reply', value: 'ring' }] },
          { text: '“He hoods them because he loves them. I don’t know how to stop that.”', to: 'sent', effects: [{ setFlag: 'falconer.reply', value: 'teodor' }] },
        ],
      },
      sent: { speaker: 'narrator', text: 'The bird takes the message, makes one tight circle over the Gate Circle so that everyone can see how it is done, and goes north for the Antler Gate and the Hawkmoor beyond it, getting smaller, until it is a speck, and then sky.', next: null },
      plain: { speaker: 'narrator', text: 'The dovecote behind the Gate Circle inn, and a lot of offended pigeons.', next: null },
    },
  },

  // ======================= ACT III, Wren’s Last Flight: the jess on the perch-post
  {
    id: 'dialogue:obj-falconer-jess-post', name: 'Wren’s Last Flight: a jess for Wren', scope: 'party',
    entries: [{ when: stage('quest:falconer-wrens-last-flight', 'jess'), node: 'post' }, { node: 'plain' }],
    nodes: {
      post: { speaker: 'narrator', text: 'The perch-post at the Heart camp, scratched by a good many feet. On the Mews, when a bird has flown its last great flight, its falconer cuts the jesses and hangs them on the eyrie wall, so the cliff remembers. Wren cut a great many jesses in her life. Nobody ever cut one for her.', next: 'cut' },
      cut: {
        speaker: 'narrator', text: 'You have a spare jess in your pouch, the one Wren knotted for your first hawk when you were small.',
        choices: [
          { text: '(Hang it on the post, with her knot still in it.)', to: 'knot' },
          { text: '(Cut it the Mews way first, one clean cut, and hang both halves.)', to: 'halves', school: 'hunt' },
        ],
      },
      knot: { speaker: 'narrator', text: 'You hang it with her knot still tied, the one she taught the Mews children, the one Odile is teaching them now. Bearers passing it on their way to the stairs touch it without knowing why, the way you touch a doorframe in a house you grew up in.', next: 'end' },
      halves: { speaker: 'narrator', text: 'One clean cut, the Mews way, and the jess falls in two. You hang both halves on the post side by side. A flight finished. A bird free. It is the highest honour on the Mews Cliffs, and you are the only person here who knows it.', next: 'end' },
      end: { speaker: 'narrator', mood: 'happy', text: 'On your shoulder, or very far away, a small bird shifts its feet. Somewhere on a ledge over the Hawkmoor, an old woman who has seen everything now is laughing at you for being sentimental, and is pleased.', next: null },
      plain: { speaker: 'narrator', text: 'The perch-post at the Heart camp, with a jess hanging from it.', next: null },
    },
  },

  // ======================= ACT III, the Hooded Steadings: the hoods, the road home
  {
    id: 'dialogue:obj-falconer-fallen-hoods', name: 'The Hooded Steadings: the three hoods', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-hooded-steadings', 'hoods'), node: 'hoods' }, { node: 'plain' }],
    nodes: {
      hoods: { speaker: 'narrator', text: 'Three soft black hoods in the dust where they fell, sewn of tears and Mews leather, quilted inside so they would not chafe. The same fine stitches as the great hood on the Stormcliffs. Somebody spent a long time making these comfortable.', next: 'do' },
      do: {
        speaker: 'narrator', text: 'A Legion sergeant is already eyeing them, the way soldiers eye anything that might be useful.',
        choices: [
          { text: '(Burn them in the camp fire.)', to: 'burn', effects: [{ setFlag: 'falconer.steading_hoods', value: 'burned' }] },
          { text: '(Unpick them, and give the Windscour folk the leather for gloves.)', to: 'gloves', effects: [{ setFlag: 'falconer.steading_hoods', value: 'gloves' }] },
        ],
      },
      burn: { speaker: 'narrator', text: 'They go up fast, with a sound like a sigh. The tears in them hiss and are gone. The old man from the Windscour watches them burn and says, to nobody, “Good riddance,” and then, “They were very comfortable,” and then nothing.', next: null },
      gloves: { speaker: 'narrator', text: 'You unpick them stitch by stitch, which takes all evening, and the tears run out of the leather as you go. In the morning the falconer from the Windscour has cut herself a new glove from it, and is wearing it, and your hawk has stepped across onto it again.', next: null },
      plain: { speaker: 'narrator', text: 'The place in the Legion camp where three hoods fell.', next: null },
    },
  },
  {
    id: 'dialogue:obj-falconer-windscour-road', name: 'The Hooded Steadings: the road east', scope: 'party',
    entries: [{ when: stage('quest:falconer-the-hooded-steadings', 'road'), node: 'dawn' }, { node: 'plain' }],
    nodes: {
      dawn: { speaker: 'narrator', text: 'First light at the east edge of the Heart camp. The three Windscour folk stand with their backs to the Citadel, the old man with a stick, the shepherd with her crook, the falconer with her glove, looking at the long road home. Nobody wants to go first.', next: 'go' },
      go: {
        speaker: 'narrator', text: 'They are all looking at you.',
        choices: [
          { text: '(Cast your hawk east along the road ahead of them.)', to: 'cast' },
          { text: 'You don’t have to be brave. You only have to go.', to: 'brave' },
        ],
      },
      cast: { speaker: 'narrator', text: 'Your hawk goes up off your fist and away east along the road, low, the way a hawk flies when it is showing a path. The falconer watches it go with her new eyes and laughs, and starts walking, and the others follow her.', next: 'end' },
      brave: { speaker: 'narrator', text: 'The shepherd nods slowly, as if that were a thing she could carry, and steps onto the road. The old man goes after her, telling her about goats. The falconer goes last, looking up, all the way, at the sky.', next: 'end' },
      end: { speaker: 'narrator', mood: 'happy', text: 'You watch them until the road bends. Not one of them looks back. That is how you know they are going to be all right: a hooded thing always looks back.', next: null },
      plain: { speaker: 'narrator', text: 'The east edge of the Heart camp, where the road home begins.', next: null },
    },
  },

  // ======================= ACT III, Fledglings Grown: the feather trail, the count
  clue('falconer-fledgling-feathers', 'Fledglings Grown: the feather trail', stage('quest:falconer-fledglings-grown', 'feathers'),
    'Barred brown feathers in the dust of the Legion camp, young hawk, Featherfall-bred, one by every tent, and by every tent something missing: a glove, a bootlace, a Legion sergeant’s spoon. The trail leads off towards the Heart camp, getting louder.',
    'falconer.feather_trail', 'A few hawk feathers in the dust between the tents.'),
  {
    id: 'dialogue:obj-falconer-feather-count', name: 'Fledglings Grown: counting for Elias', scope: 'party',
    entries: [{ when: stage('quest:falconer-fledglings-grown', 'count'), node: 'gather' }, { node: 'plain' }],
    nodes: {
      gather: { speaker: 'narrator', text: 'At the foot of the tent the four of them have taken, the ground is thick with moulted feathers. On the Featherfall, Elias Downe counts every one that falls, aloud, and has done for thirty years. He says a feather counted is a bird that lived.', next: 'count' },
      count: {
        speaker: 'narrator', text: 'You gather them into your hat and count them aloud, the Featherfall way, one breath to a feather. Above you on the ridge-pole the four young hawks lean down to listen, heads on one side.',
        choices: [
          { text: '(Count every last one, exactly.)', to: 'exact', effects: [{ setFlag: 'falconer.feather_count', value: 'exact' }] },
          { text: '(Keep the four best primaries back, one from each, unsaid.)', to: 'keep', effects: [{ setFlag: 'falconer.feather_count', value: 'kept' }] },
        ],
      },
      exact: { speaker: 'narrator', text: 'Two hundred and six. You say the last number aloud and the smallest hawk, on the end of the ridge-pole, screams it back at you, more or less. Elias Downe will want to know. You will tell him, if you get home. He will write it down in the book.', next: null },
      keep: { speaker: 'narrator', mood: 'happy', text: 'You keep four back, one from each of them, and tuck them in your hatband. On the Featherfall a feather kept and not counted means a bird that is still flying. Elias taught you that too, and forgot he had, and will be very pleased to be reminded.', next: null },
      plain: { speaker: 'narrator', text: 'The foot of a tent at the Heart camp, swept clean of feathers.', next: null },
    },
  },

];

export default dialogues;
