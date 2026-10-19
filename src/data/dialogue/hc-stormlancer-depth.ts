/**
 * Hollow Crown, STORMLANCER Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation beats, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const OG = 'npc:odran-gale' as const, TM = 'npc:tamar-mallory' as const, GF = 'npc:gwenna-fold' as const;
const HC = 'npc:hamlin-crake' as const;

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
  // ======================= I-1 The Bell in the Chimes: the strays, the steading
  {
    id: 'dialogue:area-stormlancer-pasture-night', name: 'I-1 banter: the Pastures at night', bark: true,
    entries: [{ when: stage('quest:stormlancer-the-bell-in-the-chimes', 'strays'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Every chime on the Heights is still ringing the same note, very softly, like a crowd humming a song none of them knows the words to.', next: null } },
  },
  beat('stormlancer-stray-ram-1', 'I-1 a stray ram (1)', stage('quest:stormlancer-the-bell-in-the-chimes', 'strays'),
    'A young ram wedged head-first in a hedge, back legs going like a drummer. You haul him out by the tail. He looks at you with deep offence and trots home on his own.',
    'stormlancer.stray_1', 'A ram-shaped hole in a hedge.'),
  beat('stormlancer-stray-ram-2', 'I-1 a stray ram (2)', stage('quest:stormlancer-the-bell-in-the-chimes', 'strays'),
    'An old ewe standing in Gwenna Fold’s washing, wearing a nightshirt over one horn. She has decided this is home now. It takes some time, and an apple, to change her mind.',
    'stormlancer.stray_2', 'A washing line, considerably shorter than it was.'),
  beat('stormlancer-stray-ram-3', 'I-1 a stray ram (3)', stage('quest:stormlancer-the-bell-in-the-chimes', 'strays'),
    'At the very edge of the Heights, facing the storm, a ram stands quite still. Snagged in his wool is a lance-pennant, red and gold, shredded at the end. Cass Vantor’s colours. The storm must have spat it out.',
    'stormlancer.cass_pennant', 'The edge of the Heights, and the storm beyond it.', 'You untangle it gently. It smells of hay and lightning and oranges. The ram lets you lead him home without a fuss, as if he had only been waiting to hand it over.'),
  {
    id: 'dialogue:stormlancer-odran-steading', name: 'I-1 the night at Odran’s steading', scope: 'party',
    entries: [{ node: 'in' }],
    nodes: {
      in: { speaker: 'narrator', text: 'Odran’s steading: one room, one fire, one lance over the door, and a kettle that takes a quarter of an hour to boil because he refuses to hurry it. Old Biddy has her head in through the window and is eating the curtain.', next: 'rams' },
      rams: {
        speaker: OG, text: 'All three? Good. (He pours, slowly.) Which was worst?',
        choices: [
          { text: 'The ewe in the washing.', to: 'ewe' },
          { text: 'The last one was at the edge, facing the storm. He had this in his wool.', to: 'pennant', when: { flag: 'stormlancer.cass_pennant' } },
        ],
      },
      ewe: { speaker: OG, mood: 'happy', text: 'Mopsy. She does that. Gwenna will have words. Gwenna always has words for Mopsy. They’ve known each other a long time.', next: 'stone' },
      pennant: { speaker: OG, mood: 'sad', text: '(He takes the shredded pennant and smooths it on his knee for a long time.) Cass’s. She sewed it herself, badly. Said a first rider ought to be seen coming. (He folds it up very small.) I’ll keep it. In case.', next: 'stone' },
      stone: {
        speaker: OG, text: 'Now. Your chest. The old riders said half the Storm Stone came down in the Eye of the storm, the night the crown broke, and lies there still, the only still thing in Thunderreach. Waiting for whoever can get to it.',
        choices: [
          { text: 'How do you get to the Eye?', to: 'eye' },
          { text: 'Cass went into the storm. Was she going for it?', to: 'cass' },
          { text: '(Put your hand flat on the table and feel the stone ring through the wood.)', to: 'ring', school: 'storm' },
        ],
      },
      eye: { speaker: OG, text: 'Nobody knows. Nobody’s been. The young ones think you charge it. The old ones say you can’t charge a thing that’s standing still. I think it’s the second lot, but I would. I’m slow.', next: 'cass' },
      ring: { speaker: OG, mood: 'happy', text: '(The cups rattle. Old Biddy takes her head out of the window, offended.) Steady. Steady. You’ll have the kettle over, and it’s nearly boiled, and it’s taken me all night.', next: 'cass' },
      cass: {
        speaker: OG, mood: 'sad', text: 'Cass rode into that storm a month ago, first, the way she did everything. Thistle came home on her own the next morning, soaked, with the bridle gone. Cass didn’t. That’s all anybody knows.',
        choices: [
          { text: 'She’ll come back. She always comes back first.', to: 'back' },
          { text: 'You taught her to ride.', to: 'taught', trust: 1 },
        ],
      },
      back: { speaker: OG, text: 'Maybe. I’ve stopped telling the clans that. They want her back the way she was, and nothing comes out of a storm the way it went in. Not rams. Not riders. Not weather, even.', next: 'sky' },
      taught: { speaker: OG, mood: 'sad', text: 'I taught her to stay on. I never managed to teach her to stop. Tried for ten years. She’d laugh, and go, and be over the next hill before I’d finished the sentence.', next: 'sky' },
      sky: { speaker: OG, text: 'Tomorrow, read the sky for me. The lightning’s been falling wrong all month, and I want a young pair of eyes on the pattern-stones. No hurry. Drink your tea.', next: 'end' },
      end: { speaker: 'narrator', text: 'The kettle finally boils, at dawn. Odran pours it with enormous satisfaction, and falls asleep in his chair before he can drink it.', next: null },
    },
  },

  // ======================= I-2 Reading the Sky: following the black strikes
  beat('stormlancer-black-strike-1', 'I-2 a black strike (1)', stage('quest:stormlancer-reading-the-sky', 'strikes'),
    'A fresh scorch on the grazing, black at the heart, the grass round it dead in a ring. Not a line from north to south like the old strikes. A ring.',
    'stormlancer.strike_1', 'A scorched ring in the grass, already greening at the edge.'),
  beat('stormlancer-black-strike-2', 'I-2 a black strike (2)', stage('quest:stormlancer-reading-the-sky', 'strikes'),
    'Another, inside the first, smaller. The rings are getting tighter, night by night, round the hollow where the herd sleeps. Something is drawing a target.',
    'stormlancer.strike_2', 'A smaller scorched ring.'),
  beat('stormlancer-black-strike-3', 'I-2 a black strike (3)', stage('quest:stormlancer-reading-the-sky', 'strikes'),
    'The smallest ring, right in the hollow. Out of the middle of it run hoofprints as big as plates, deep and scorched, climbing away up the slope towards the Ram King’s Crag, and the prints of a dozen smaller rams following.',
    'stormlancer.ram_tracks', 'Hoofprints in the turf, leading up towards the crag.'),

  // ======================= I-3 The Ram King’s Crag: the path up
  {
    id: 'dialogue:area-stormlancer-crag-path', name: 'I-3 banter: up to the crag', bark: true,
    entries: [{ when: stage('quest:stormlancer-the-ram-kings-crag', 'crag'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Ram-tracks all the way up the crag path, in single file, perfectly in step. Rams never walk in step. Somebody at the front is calling the time.', next: null } },
  },

  // ======================= I-5 The Great Charge: Tamar and Gwenna before the muster
  {
    id: 'dialogue:stormlancer-tamar-canvass', name: 'I-5 Tamar before the muster', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TM, mood: 'happy', text: 'Charge it! What else is there? The old law says when a storm won’t pass, we charge, and Cass went in alone and came out faster than anyone alive. If she can, we all can.', next: 'why' },
      why: {
        speaker: TM, text: 'And don’t say slow. Don’t you dare say slow. My whole life the old ones have said wait. Wait for the wind. Wait for your turn. Wait to be good enough. I’m done waiting.',
        choices: [
          { text: 'And if you come back like Cass?', to: 'like' },
          { text: 'What’s your nan say?', to: 'nan' },
        ],
      },
      like: { speaker: TM, text: 'Fast? Laughing? Never tired? (She hesitates, a hair.) There are worse ways to come back. There are worse ways to not.', choices: more(offer('quest:stormlancer-the-cowards-cairn', 'What’s that cairn behind you?', 'cairn')) },
      nan: { speaker: TM, mood: 'sad', text: '(She looks at the Coward’s Cairn behind her, and away again.) My nan doesn’t say anything. She’s on the third row. That’s what she says.', choices: more(offer('quest:stormlancer-the-cowards-cairn', 'What’s the oldest name on it?', 'cairn')) },
      cairn: { speaker: TM, text: 'Bet you can’t read the oldest name. It’s right at the bottom. Go on. I dare you. And when you’ve read it, you’ll want a word with somebody.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-gwenna-canvass', name: 'I-5 Gwenna before the muster', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GF, text: 'The muster. (She doesn’t look up from the ram whose hoof she’s trimming.) Three hundred head. Everybody wants to talk about who rides first. Nobody ever asks who brings the herd home after.', effects: [{ setFlag: 'stormlancer.gwenna_asked', value: true }], next: 'count' },
      count: {
        speaker: GF, text: 'A charge on the storm’s edge, I lose a third to the lightning and a third to panic. Shelter in the gorge, I lose a season’s grazing and half the young lancers’ respect. I don’t care about their respect. I care about the grazing.',
        choices: [
          { text: 'Will you say that at the muster?', to: 'say' },
          { text: 'You and Odran think alike.', to: 'odran' },
        ],
      },
      say: { speaker: GF, text: 'If somebody gives me a gap to say it in. They won’t. They never do. You might.', choices: more(offer('quest:stormlancer-bounty-pasture-wisps', 'Any bounties on the post?', 'wisps')) },
      odran: { speaker: GF, mood: 'happy', text: 'Odran Gale has never thought alike with anybody in his life. He thinks slower, and arrives at the same place an hour later, looking pleased with himself. (She smiles, very slightly.) He’s usually right, the old goat.', choices: more(offer('quest:stormlancer-bounty-pasture-wisps', 'Any bounties on the post?', 'wisps')) },
      wisps: { speaker: GF, text: 'Hollow Static Wisps in the long grass at dusk, spooking the herds. Six of them. A spooked ram runs till it hits something, and the something is usually me.', next: null },
    },
  },

  // ======================= I-6 Old Clatterwing: down into the gorge
  {
    id: 'dialogue:area-stormlancer-gorge-descent', name: 'I-6 banter: down into Skyfall Gorge', bark: true,
    entries: [{ when: stage('quest:stormlancer-old-clatterwing', 'aerie'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Something small and crackling falls past you down the gorge, screaming with indignation, and lands in a bush. A fledgling. Another one falls a moment later. Something up there is throwing its children away.', next: null } },
  },

  // ======================= I-7 Faster Than Grief: the Brave Stone
  {
    id: 'dialogue:obj-stormlancer-brave-stone', name: 'I-7 the Brave Stone', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-faster-than-grief', 'stone'), node: 'stone' }, { node: 'plain' }],
    nodes: {
      stone: { speaker: 'narrator', text: 'The Brave Stone, a slab of slate as tall as a ram standing on another ram, carved from top to bottom with the names of the first riders, every charge for a thousand years. The newest name is at the very top, cut by hand, deep and crooked: CASS VANTOR.', next: 'under' },
      under: {
        speaker: 'narrator', text: 'Nobody carves themselves onto the Brave Stone. The clans do it, after. She carved her own name the day before she rode in. And under it, smaller, in the same crooked hand: AND THISTLE.',
        effects: [{ setFlag: 'stormlancer.brave_stone', value: true }, { unlockLore: 'lore:hc-storm-brave-stone' }],
        choices: [
          { text: '(Touch the second name.)', to: 'touch' },
          { text: '(Look across the plain at the Coward’s Cairn.)', to: 'cairn' },
        ],
      },
      touch: { speaker: 'narrator', text: 'The cuts are rough and fresh, and there is blood dried in the last letter, where her knife slipped. She meant them both to come home famous. Only one of them came home at all.', next: null },
      cairn: { speaker: 'narrator', text: 'Across the plain the Coward’s Cairn sits low and grey, with Odran Gale’s name at the bottom of it. From here the two stones look exactly the same size.', next: null },
      plain: { speaker: 'narrator', text: 'The Brave Stone, carved with a thousand years of first riders.', next: null },
    },
  },

  // ======================= I-9 The Long Ride Down: the riders’ cairn, the cliff road
  {
    id: 'dialogue:obj-stormlancer-riders-cairn', name: 'I-9 the riders’ cairn on the cliff road', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-the-long-ride-down', 'cairn'), node: 'cairn' }, { node: 'plain' }],
    nodes: {
      cairn: { speaker: 'narrator', text: 'Halfway down the cliff road, a waist-high cairn wound all over with threads, a thousand years of them, faded to the colour of the stone: one from the pennant of every lancer who ever rode down off the Heights to see the world.', next: 'tie' },
      tie: {
        speaker: 'narrator', text: 'The newest threads are thirty years old. Nobody has ridden down since the gate shut. Odran is watching you from Biddy’s back, very carefully not saying anything.',
        choices: [
          { text: '(Tie a thread from Odran’s pennant.)', to: 'pennant', when: { flag: 'stormlancer.odran_farewell', op: '==', value: 'pennant' }, effects: [{ unlockLore: 'lore:hc-storm-riders-cairn' }] },
          { text: '(Tie a thread from your own sleeve.)', to: 'sleeve', effects: [{ unlockLore: 'lore:hc-storm-riders-cairn' }] },
        ],
      },
      pennant: { speaker: OG, mood: 'happy', text: '(He watches you knot the blue-grey thread on top of all the others.) That’s my colour going out into the world again. First time in forty years. Feels better than I thought. Feels like being second.', next: null },
      sleeve: { speaker: OG, text: 'There. Now the Heights know you went. (He looks down the road for a while.) When you come back up, you take one off. That’s the other half of it. Nobody ever tells you that half.', next: null },
      plain: { speaker: 'narrator', text: 'The riders’ cairn on the cliff road, wound with a thousand years of thread.', next: null },
    },
  },
  {
    id: 'dialogue:area-stormlancer-cliff-road', name: 'I-9 banter: down the cliff road', bark: true,
    entries: [{ when: stage('quest:stormlancer-the-long-ride-down', 'road'), node: 'b' }],
    nodes: { b: { speaker: OG, text: '(Somewhere behind you, from the ground.) Biddy’s thrown me. I’m fine. Go on. I’ll catch up. Eventually.', next: null } },
  },

  // ======================= Side: Thistle Won’t Eat (the storm’s edge)
  {
    id: 'dialogue:obj-stormlancer-thistle-lookout', name: 'Thistle Won’t Eat: the storm’s edge', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-thistle-wont-eat', 'edge'), node: 'edge' }, { node: 'plain' }],
    nodes: {
      edge: { speaker: 'narrator', text: 'At the edge of the Heights, with the storm walking across the plain below, Thistle stops. She stands for a long time with the blue blanket on her back and the wind in her wool, looking at it.', next: 'call' },
      call: {
        speaker: 'narrator', text: 'Then she lifts her head and calls, once, a long ram’s bellow that goes out over the plain and into the storm.',
        choices: [
          { text: '(Stand with her.)', to: 'stand' },
          { text: '(Call too.)', to: 'too' },
        ],
      },
      stand: { speaker: 'narrator', text: 'Far out on the Heights a black streak of lightning that has been running all day, round and round, stops dead. Just for a moment. Then it goes on. Thistle watches it go, and turns, and walks home beside you, eating the grass as she goes.', next: null },
      too: { speaker: 'narrator', text: 'Your voice and hers go out together. Far out on the Heights a black streak stops dead, and turns, and for one moment faces you both. Then it goes. Thistle walks home beside you, eating, the whole way.', next: null },
      plain: { speaker: 'narrator', text: 'The edge of the Heights. A trampled place where a ram stood a long time.', next: null },
    },
  },

  // ======================= Side: the Chime-Maker (the Bell-note chime for Odran)
  {
    id: 'dialogue:stormlancer-odran-chime', name: 'The Chime-Maker: a chime for Odran’s door', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: OG, text: '(He holds the little chime up to his ear, lying in the grass, and listens to it ring the Bell’s note, on its own, for a long time.) Wendeline sent this? For my door?', next: 'door' },
      door: {
        speaker: OG, mood: 'sad', text: 'Maudie loved chimes. Had nineteen on that door once. Took them all down when she got poorly, said they kept her awake. I never put them back.',
        choices: [
          { text: 'Put this one up.', to: 'up', trust: 1 },
          { text: 'Do you know what rang that note?', to: 'rang' },
        ],
      },
      up: { speaker: OG, text: '(He gets up, which takes a while, and hangs it over the door beside the lance.) There. It’s rung on its own since you walked up. It isn’t rung by the wind. It’s rung by something far off, asking. That’s a good thing to have over a door.', next: null },
      rang: { speaker: OG, text: 'Something a long way off that wanted every one of us to wake up at once. (He hangs it over the door.) Whatever it was, it got its wish. Let it ring. I’ll listen. I’ve got time.', next: null },
    },
  },

  // ======================= Side: Learn the Pattern (the wake-stone)
  {
    id: 'dialogue:obj-stormlancer-wake-stone', name: 'Learn the Pattern: the oldest pattern-stone', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-learn-the-pattern', 'wake'), node: 'stone' }, { node: 'plain' }],
    nodes: {
      stone: {
        speaker: 'narrator', text: 'A lone pattern-stone on the far side of the Heights, older than the rest, moss in its scorches. Carved round its rim are hoofprints, all going one way, following a lightning-mark that points ahead of them. Behind the storm, never in front of it.',
        choices: [
          { text: '(Follow the carved hoofprints round the rim.)', to: 'round', insight: 'ride_the_wake' },
          { text: '(Look for Osric’s boot-scorch on it.)', to: 'boot' },
        ],
      },
      round: { speaker: 'narrator', text: 'The oldest riders rode behind the storm, with the lightning already fallen, and the wind at their backs pushing them home. Somebody carved the whole of it into a stone so that nobody would have to learn it by falling off. Everybody learned it by falling off anyway.', next: null },
      boot: { speaker: 'narrator', text: 'There isn’t one. This is the only stone on the Heights without a scorch from Osric’s boots on it. You scratch a small boot on it in chalk, so he can feel he has been.', next: null },
      plain: { speaker: 'narrator', text: 'The oldest pattern-stone, mossy, alone on the far side of the Heights.', next: null },
    },
  },

  // ======================= Side: the Coward’s Cairn (telling Tamar)
  {
    id: 'dialogue:stormlancer-tamar-told', name: 'The Coward’s Cairn: telling Tamar', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TM, text: 'Well? Read it? Talked to him? (She’s grinning.) Go on. What did the great Odran Gale say about being a coward?', next: 'tell' },
      tell: {
        speaker: 'narrator', text: 'You tell her: the charge, the rider thrown in the rain, Odran turning round against everyone, Maudie. Then what he said about her nan on the third row, who turned back to carry her own brother out.',
        choices: [
          { text: 'Your nan isn’t on that cairn for being afraid.', to: 'nan', trust: 1, trustNpc: TM },
          { text: 'Some of the bravest names are on the wrong stone.', to: 'wrong' },
        ],
      },
      nan: { speaker: TM, mood: 'sad', text: '(For a long time she doesn’t say anything.) She carried Uncle Dav out. He lived to ninety. I never knew. Everyone just said she turned back.', next: 'heart' },
      wrong: { speaker: TM, text: 'Wrong stone. (She looks at the cairn, then at the Brave Stone across the plain.) Wrong stone. Huh.', next: 'heart' },
      heart: { speaker: 'narrator', text: 'Tamar walks over to the Coward’s Cairn, finds the third row, and with the point of her knife scratches a small heart beside one name. She doesn’t spit on the way back.', next: null },
    },
  },

  // ======================= Side: the Fallen Fledgling (the updraft ledge)
  {
    id: 'dialogue:obj-stormlancer-updraft-ledge', name: 'The Fallen Fledgling: the updraft ledge', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-the-fallen-fledgling', 'updraft'), node: 'ledge' }, { node: 'plain' }],
    nodes: {
      ledge: {
        speaker: 'narrator', text: 'The updraft ledge, halfway up the gorge, where the air comes up from the river warm and fast. The fledgling stands on the edge with its wings half open, crackling, and looks at you. It would like, clearly, for you to go first.',
        choices: [
          { text: '(Hold it up into the wind and let go.)', to: 'go' },
          { text: '(Flap your arms at it. Demonstrate.)', to: 'flap' },
        ],
      },
      go: { speaker: 'narrator', text: 'The updraft takes it. It goes up, screaming, wobbling, a little ball of sparks against the grey, and up, and round, and comes down on your head, very pleased, and stays there.', next: null },
      flap: { speaker: 'narrator', text: 'You flap. It watches with enormous contempt. Then it jumps, to show you how it’s done, and the wind takes it up and round and back, and it lands on your head, crackling, as if you had been the one to learn something.', next: null },
      plain: { speaker: 'narrator', text: 'The updraft ledge in Skyfall Gorge, warm air rushing up.', next: null },
    },
  },

  // ======================= Side: the Rockfall Wager (the back of the post)
  beat('stormlancer-wager-post', 'The Rockfall Wager: the back of the post', stage('quest:stormlancer-the-rockfall-wager', 'post'),
    'The wager-post at the top of the gorge path. On the front, a hundred years of names: everyone who went through first. On the back, in smaller letters, nobody’s idea of a joke: everyone who went first and didn’t come through. The back is longer.',
    'stormlancer.post_read', 'The wager-post at the top of the gorge path.', 'At the bottom of the back, very new, somebody has started a third list, headed SECOND. There is one name on it so far: RORY GUST.'),

  // ======================= Side: the Stair-Counter (Tally’s first book)
  beat('stormlancer-tally-book', 'The Stair-Counter: Tally’s first counting-book', stage('quest:stormlancer-the-stair-counter', 'book'),
    'A swollen notebook in the bracken below the Steps, thirty winters old. Page after page: 303. 303. 303. Then one morning, in a furious scrawl: “304!!! SOMETHING CAME DOWN IN THE NIGHT AND SAT ON THE STAIRS.” Then, next day: “303. Gone. Nobody believes me.”',
    'stormlancer.first_book', 'Bracken at the foot of the Eyrie Steps.', 'The date on that page is the night the crown broke. Whatever came down that night sat on the Steps until morning, and then went on, into the storm, to the Eye. Now it has come back to sit there again.'),

  // ======================= Side: Feathers for the Pennant (the matriarch’s feather)
  {
    id: 'dialogue:obj-stormlancer-matriarch-feather', name: 'Feathers for the Pennant: Old Clatterwing’s feather', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-feathers-for-the-pennant', 'matriarch'), node: 'bird' }, { node: 'plain' }],
    nodes: {
      bird: {
        speaker: 'narrator', text: 'Old Clatterwing is roosting at the foot of the Aerie with her fledglings asleep under her wings, clean grey now, the black moulted out. She opens one eye at you, the size of a dinner plate.',
        choices: [
          { text: '(Hold out a fish.)', to: 'fish' },
          { text: '(Bow, the way a lancer bows to a Thunderbird.)', to: 'bow' },
        ],
      },
      fish: { speaker: 'narrator', text: 'She takes the fish with great dignity and swallows it whole. Then she reaches round with her beak and pulls one long tail-feather out of herself, and drops it at your feet, as if paying a bill.', next: null },
      bow: { speaker: 'narrator', text: 'She looks at you a long while. Then she lowers her head, almost to the ground, and when she lifts it there is a long grey feather lying where it was. She closes her eye and goes back to sleep.', next: null },
      plain: { speaker: 'narrator', text: 'The foot of the Thunderbird Aerie, where Old Clatterwing roosts.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds round the Thunderclap Heights
  {
    id: 'dialogue:obj-storm-frontier-ruin-find', name: 'Heights ruin: the old charge-yard', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A ruined yard of dry-stone walls, older than any steading on the Heights, with iron rings set in the stones for tethering rams. Over the gate, cut deep: WE RIDE BEHIND. Someone, much later, has added in chalk: OR IN FRONT, IF WE FEEL LIKE IT.', effects: [{ unlockLore: 'lore:hc-storm-frontier-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-storm-frontier-cave-find', name: 'Heights cave: the thunder hollow', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A deep hollow under the Heights where the thunder comes down through the rock and rolls round and round the walls, so loud you feel it in your teeth. Rams’ skulls line the ledges, hundreds, each with a name painted on its brow. This is where the clans bring their old rams to lie down.', effects: [{ unlockLore: 'lore:hc-storm-frontier-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-storm-frontier-cave-codex', name: 'Heights cave: a lancer’s letter', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A letter tucked behind a ram’s skull, never sent: “Dear Odran, I am writing this from the hollow because you can’t hear yourself think here, which is the only way I can say it. You may keep your name on that cairn. I am keeping you. M.”', effects: [{ unlockLore: 'lore:hc-storm-frontier-letter' }], next: null } },
  },
  {
    id: 'dialogue:obj-storm-frontier-view-find', name: 'Heights viewpoint: Stormwatch Rock', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'From Stormwatch Rock the whole of the Heights lies below, and the storm on it, turning slowly round its Eye like a great dark wheel. From up here you can see what nobody on the ground can: the storm is not trying to leave. It is trying to keep something in the middle safe.', effects: [{ unlockLore: 'lore:hc-storm-frontier-view' }], next: null } },
  },
  // ======================= ACT II (wave 2 depth): C-1 the dare-board
  {
    id: 'dialogue:obj-stormlancer-dare-board', name: 'C-1 the Wind Yard’s dare-board', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-cliffstair', 'board'), node: 'board' }, { node: 'plain' }],
    nodes: {
      board: { speaker: 'narrator', text: 'A plank by the Wind Yard gate, chalked with thirty years of names and how far up the Stormcliffs each lancer got. FIRST FLAG. FIRST FLAG. HALFWAY, THEN THE GOAT SAT DOWN. The top line has been left blank since C. 1012.', next: 'names' },
      names: { speaker: 'narrator', text: 'Right at the bottom, older than the rest and chalked over many times so it never fades: H. CRAKE. THIRD FLAG. WIND TURNED.', next: 'hamlin' },
      hamlin: {
        speaker: HC, text: 'That top line’s for whoever goes first. Heights custom: you chalk your name before you go up, so it’s there if you don’t come down. Or after, if you’re the careful sort.',
        choices: [
          { text: '(Chalk your name on the top line now.)', to: 'now', effects: [{ setFlag: 'stormlancer.dare_board', value: 'before' }] },
          { text: '(Leave it blank until you’re back.)', to: 'after', effects: [{ setFlag: 'stormlancer.dare_board', value: 'after' }] },
          { text: '(Chalk a second line under it: WHOEVER COMES NEXT.)', to: 'second', when: { insight: 'ride_the_wake' }, effects: [{ setFlag: 'stormlancer.dare_board', value: 'second' }] },
        ],
      },
      now: { speaker: HC, mood: 'happy', text: 'Bold. Very Heights. If you fall off, we’ll leave it up, out of respect.', next: null },
      after: { speaker: HC, text: 'Careful. Very un-Heights. One of Odran’s, are you? (He grins under the moustache.)', next: null },
      second: { speaker: HC, text: '(He reads it twice.) …Huh. In thirty years nobody’s ever put a second line on that board.', next: null },
      plain: { speaker: 'narrator', text: 'The Wind Yard’s dare-board, chalked from top to bottom.', next: null },
    },
  },

  // ======================= ACT II, C-2 The Cliff Charge: Hamlin comes up behind you
  {
    id: 'dialogue:stormlancer-hamlin-lip', name: 'C-2 Hamlin at the lip of the cliff', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'At the lip of the cliff, just under the last flag, a goat comes up the rock behind you at a steady, unhurried scramble. Hamlin Crake is on its back, white to the lips.', next: 'ham' },
      ham: {
        speaker: HC, text: 'Don’t say anything. (He gets off, very carefully.) Thirty years I’ve kept that dare. I made it up, you know. The night the arches shut. Somebody had to make the young ones want to go up, so they wouldn’t sit at the bottom crying.',
        choices: [
          { text: 'And you never went yourself.', to: 'never' },
          { text: 'You came up behind me.', to: 'behind', trust: 1 },
        ],
      },
      never: { speaker: HC, mood: 'sad', text: 'Once. Third flag. Then I looked down, and came back, and I’ve told everybody since that the wind turned. The wind did not turn.', next: 'second' },
      behind: { speaker: HC, mood: 'happy', text: 'I did. In your wake, out of the wind, up every ledge you’d already tried. (He laughs, a bit shakily.) It’s a great deal easier going second. Nobody ever tells you that.', next: 'second' },
      second: { speaker: HC, text: 'Go on. The last flag’s yours; you went first, you earned it. I’ll sit here with Mutton and be very proud of myself, quietly.', next: 'goat' },
      goat: { speaker: 'narrator', mood: 'happy', text: 'Mutton the goat eats the third charge-flag. Hamlin does not stop him.', next: null },
    },
  },

  // ======================= ACT II, C-3 The Stormcrow: telling Hamlin
  {
    id: 'dialogue:stormlancer-hamlin-crow', name: 'C-3 Hamlin hears what the Stormcrow asked', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HC, text: 'Quiet up there. (Twenty goats are looking up at the cliff with their ears forward.) Mutton and I came down the long way. What did it say? The bird. Before the end.',
        choices: [
          { text: 'It asked if being first ever did it any good.', to: 'first' },
          { text: 'It was tired of carrying news nobody was waiting for.', to: 'tired' },
        ],
      },
      first: {
        speaker: HC, text: '(He thinks about it for a long time, chewing his moustache.) And? Did it?',
        choices: [
          { text: 'It always got there first. There was never anybody there to hear it.', to: 'board' },
          { text: 'It was never alone up there. It only thought it was.', to: 'board', trust: 1 },
        ],
      },
      tired: { speaker: HC, mood: 'sad', text: 'Aye. It would be. Thirty years of shouting the same thing at people who’d stopped looking up.', next: 'board' },
      board: { speaker: HC, text: 'I’ve rubbed out my line on the board. Thirty years of a lie in chalk. Put up a new one for me: H. CRAKE AND MUTTON. SECOND. ALL THE WAY.', effects: [{ setFlag: 'stormlancer.hamlin_board', value: true }], next: 'go' },
      go: { speaker: HC, text: 'Now. There’s a watchman at Wardenhold who’s written to the Wind Yard twice about a runner on Frostmere Pass. Heights colours, she says. Laughing. I think you know who.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Race on the Pass: Cass’s trail
  ...[
    'Footprints in the snow at the foot of the pass road, a full stride apart, each one scorched black at the toe. They never walk. Not once, all the way up.',
    'A racing ribbon snagged on a patrol cairn, Lance Clan blue, the kind they pin on the first rider in at the Thunderclap Run. Cass always wore hers. This one has been torn off and left, because it fluttered, and fluttering is slow.',
    'A hollow racer sitting in the snow at the roadside: one of hers, fallen behind. He can’t get up, and he can’t stop. His legs are still running in the drift, going nowhere.',
  ].map((text, i): DialogueDef => beat(`stormlancer-cass-sign-${i + 1}`, `C-4 Cass’s trail (${i + 1})`, stage('quest:stormlancer-the-race-on-the-pass', 'trail'),
    text, `stormlancer.trail_${i + 1}`, 'Old tracks in the snow, mostly drifted over.', i === 2 ? 'Beside him in the drift, written with a finger and half filled in: FASTER. It is in Cass’s hand. She used to write it on the back of your hand before every Run, for luck.' : undefined)),

  // ======================= ACT II, C-5 The Rimeheart Colossus: the lance at the top of the pass
  beat('stormlancer-cass-lance', 'C-5 the lance left at the top of the pass', stage('quest:stormlancer-rimeheart-colossus', 'lance'),
    'Beyond where the Colossus stood, the road runs on downhill and the snow hasn’t settled yet. In it, one line of scorched footprints, going over, fast. Stuck upright at the top of the road: a lance, Cass’s, with her clan pennant still on it.',
    'stormlancer.cass_lance', 'The top of the pass road, and a hole in the snow where something stood upright.',
    'She left it. It slowed her down. You pull it out of the snow and it is very light, the way a thing is light when somebody has stopped carrying it.'),

  // ======================= ACT II, C-6 Old Biddy Brings Word: the answer
  {
    id: 'dialogue:stormlancer-biddy-reply', name: 'C-6 an answer for Odran, by ram', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator', text: 'Old Biddy has finished the Gate Circle’s grass and started on its hedge. She looks at you with the patience of a ram who will go home at her own pace whatever you write. You have a pencil and the back of Odran’s note.',
        choices: [
          { text: '(Write: “Not first. Second. Promise.”)', to: 'tie', effects: [{ setFlag: 'stormlancer.reply', value: 'second' }] },
          { text: '(Write: “Found Cass. She can’t stop. I’ll stop her.”)', to: 'tie', effects: [{ setFlag: 'stormlancer.reply', value: 'cass' }] },
          { text: '(Write: “Biddy has eaten the Gate Circle. Sending her back before she starts on Brindlecross.”)', to: 'tie', effects: [{ setFlag: 'stormlancer.reply', value: 'biddy' }] },
        ],
      },
      tie: { speaker: 'narrator', mood: 'happy', text: 'You tie it to her horn with the same bootlace. She turns round, unhurried, and ambles back through the Storm arch towards the Heights, stopping twice to eat things. It will be old news by the time it gets there. That’s all right.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-lob-reply', name: 'C-6 an answer for Odran, by runner', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:lob-ferris', text: 'Got your answer? I’ll take it back slow. The Lancemaster said everything goes back slow, so it sinks in.',
        choices: [
          { text: '“Not first. Second. Promise.”', to: 'go', effects: [{ setFlag: 'stormlancer.reply', value: 'second' }] },
          { text: '“Found Cass. She can’t stop. I’ll stop her.”', to: 'go', effects: [{ setFlag: 'stormlancer.reply', value: 'cass' }] },
          { text: '“Biddy hasn’t thrown me yet. Tell him she’s trying.”', to: 'go', effects: [{ setFlag: 'stormlancer.reply', value: 'biddy' }] },
        ],
      },
      go: { speaker: 'npc:lob-ferris', text: '(He says it back to you twice, very slowly, and sets off through the Storm arch at a walk. He looks back once, and waves, and very nearly breaks into a run, and doesn’t.)', next: null },
    },
  },

  // ======================= ACT III, Thistle: the tracks, the hay
  beat('stormlancer-thistle-tracks', 'Thistle: the tracks at the camp’s edge', stage('quest:stormlancer-thistle', 'tracks'),
    'Hoofprints at the edge of the Heart camp, a Storm Ram’s, a stride apart: a walk. Every few yards there is a tuft of grey wool on a thorn, as if she stopped to scratch and then went on.',
    'stormlancer.thistle_tracks', 'Old hoofprints at the edge of the camp, at a walk.',
    'The tracks don’t go into the camp. They go round it, and up, onto the Storm stair, still at a walk. Somebody has left a bucket of water beside them, and it has been drunk.'),
  {
    id: 'dialogue:obj-stormlancer-hay-cart', name: 'Thistle: the hay', scope: 'party',
    entries: [
      { when: { all: [stage('quest:stormlancer-thistle', 'hay'), { flag: 'stormlancer.nemesis_fate', op: '==', value: 'spared' }] }, node: 'spared' },
      { when: stage('quest:stormlancer-thistle', 'hay'), node: 'alone' },
      { node: 'plain' },
    ],
    nodes: {
      spared: { speaker: 'narrator', text: 'Cass and Thistle come down through the camp at a walk. You fork an armful of hay off the supply cart and hold it out, and Thistle stops, which Cass lets her do, and eats out of your arms for a long time.', next: 'cass' },
      cass: { speaker: 'npc:cass-vantor', mood: 'happy', text: 'She never ate when I was racing her. Too wound up. (She laughs, wet.) Look at her. She’s a glutton. She’s been a glutton all along, and I never let her.', effects: [{ setFlag: 'stormlancer.thistle_fed', value: 'cass' }], next: null },
      alone: { speaker: 'narrator', text: 'You fork an armful of hay off the supply cart and carry it all the way up the Storm stair. Thistle is where you left her, facing the place where Cass fell. You put the hay down by her feet.', next: 'eat' },
      eat: { speaker: 'narrator', mood: 'sad', text: 'For a long time she doesn’t move. Then she lowers her head and eats, slowly, the way a ram eats when there is nobody to race. “Cass’s ram eats now,” Odran wrote. She does.', effects: [{ setFlag: 'stormlancer.thistle_fed', value: 'alone' }], next: null },
      plain: { speaker: 'narrator', text: 'A supply cart at the Heart camp, with a ram-sized gap in its hay.', next: null },
    },
  },

  // ======================= ACT III, The Ones Who Came Back Fast: walking, and the fire
  {
    id: 'dialogue:obj-stormlancer-walking-line', name: 'The Ones Who Came Back Fast: walking them out', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-the-ones-who-came-back-fast', 'walk'), node: 'line' }, { node: 'plain' }],
    nodes: {
      line: { speaker: 'narrator', text: 'The fast ones are standing still now, and that is the trouble: they only know two speeds, flat out and not at all. One of them tries a single step and nearly falls over.', next: 'drill' },
      drill: {
        speaker: 'narrator', text: 'The Lance Clans have a drill for colts, the oldest one: you walk beside them, call the pace, and never let them get ahead of you.',
        choices: [
          { text: '(Call it the Heights way: “Walk. Walk. Walk.”)', to: 'walk', effects: [{ setFlag: 'stormlancer.fast_walk', value: 'heights' }] },
          { text: '(Call it Odran’s way: “No hurry.”)', to: 'odran', effects: [{ setFlag: 'stormlancer.fast_walk', value: 'odran' }] },
        ],
      },
      walk: { speaker: 'narrator', text: 'You call the pace, and they come with you, one stiff step at a time, out of the Legion’s ranks, like colts on their first morning. Whenever one of them speeds up you say walk, and they do.', next: null },
      odran: { speaker: 'narrator', mood: 'happy', text: '“No hurry,” you say, and again, and again, until it stops being words and is only the pace. They come with you out of the Legion, step by step. One of them is laughing under her breath. “No hurry,” she says back.', next: null },
      plain: { speaker: 'narrator', text: 'Footprints leading out of the Legion camp, close together, at a walk.', next: null },
    },
  },
  {
    id: 'dialogue:obj-stormlancer-lancers-fire', name: 'The Ones Who Came Back Fast: the fire', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-the-ones-who-came-back-fast', 'fire'), node: 'fire' }, { node: 'plain' }],
    nodes: {
      fire: {
        speaker: 'narrator', text: 'At the Heart camp the fast ones sit round a fire of their own, close together, steaming, the way lancers sit after the Run. Somebody passes a flask. Somebody asks the question every lancer asks after a race: who came in first?',
        choices: [
          { text: '“Nobody. We all came in.”', to: 'all' },
          { text: '“The last one in. That’s the new first.”', to: 'last' },
        ],
      },
      all: { speaker: 'narrator', mood: 'happy', text: 'There is a silence. Then the youngest starts to laugh, and can’t stop, and it isn’t the hollow laugh. The black on their faces has run off into the dirt, and stayed there.', effects: [{ setFlag: 'stormlancer.fast_home', value: 'all' }], next: null },
      last: { speaker: 'narrator', mood: 'happy', text: '“The last one in,” the youngest says, trying it out. She points at the oldest of them, a grey woman still shaking from the walk. Everyone at the fire raises a cup to her, and the grey woman, astonished, raises hers back.', effects: [{ setFlag: 'stormlancer.fast_home', value: 'last' }], next: null },
      plain: { speaker: 'narrator', text: 'A small fire at the Heart camp, with lancers round it, sitting still on purpose.', next: null },
    },
  },
];

export default dialogues;
