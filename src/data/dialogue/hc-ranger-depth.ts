/**
 * Hollow Crown, RANGER Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation beats, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const HB = 'npc:holt-barrow' as const, AM = 'npc:aldo-mire' as const, OC = 'npc:old-cattail' as const;
const CT = 'npc:cobb-tinsley' as const, BH = 'npc:bram-hatchley' as const, TG = 'npc:teasel-gammon' as const;
const RC1: Q = 'quest:ranger-the-hedge-house', RC2: Q = 'quest:ranger-stags-rest', RC6: Q = 'quest:ranger-holts-blaze';
const LAST: Q = 'quest:ranger-holts-last-blaze', GARDEN: Q = 'quest:ranger-aldos-garden', SALT: Q = 'quest:ranger-the-salt-thief-abroad';

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
/** a one-node find (optional areas) that unlocks a codex entry */
const find = (id: string, name: string, text: string, lore: `lore:${string}`): DialogueDef => ({
  id: `dialogue:obj-${id}`, name, scope: 'party',
  entries: [{ node: 'find' }],
  nodes: { find: { speaker: 'narrator', text, effects: [{ unlockLore: lore }], next: null } },
});

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Bell in the Thorns: down the lookout steps, the map-stone
  {
    id: 'dialogue:area-ranger-lookout-steps', name: 'I-1 banter: down the lookout steps', bark: true,
    entries: [{ when: stage('quest:ranger-the-bell-in-the-thorns', 'paths'), node: 'b' }],
    nodes: { b: { speaker: HB, text: '(From the bottom of the steps, without turning round.) Mind the ninth step. It’s been loose since your mother was your age. I keep meaning to.', next: null } },
  },
  {
    id: 'dialogue:ranger-holt-map', name: 'I-1 the map-stone by lantern-light', scope: 'party',
    entries: [{ node: 'stone' }],
    nodes: {
      stone: { speaker: 'narrator', text: 'The map-stone stands by the camp gate: a slab of grey rock as tall as a door, cut all over with the Wayfarers’ paths, and every path re-cut a hundred times as the Thornwilds moved. Holt holds the lantern up to it. Then he holds it up to the forest. Then to the stone again.', next: 'wrong' },
      wrong: { speaker: HB, text: 'All wrong. Every line on it. (He traces one with a thumb.) The Elk Path went north. Now it goes east, round the pond. The Ferry Way’s gone into the Bloomfen and come out the other side backwards.', next: 'ask' },
      ask: {
        speaker: HB, text: 'Paths move a bit every night. Always have. A pace here. A tree there. This is the whole forest stood up and sat down somewhere else.',
        choices: [
          { text: 'Because of the bell?', to: 'bell' },
          { text: 'Because of what’s singing in me?', to: 'me' },
          { text: '(Put your palm on the stone and listen to the forest through it.)', to: 'listen', school: 'verdant' },
        ],
      },
      bell: { speaker: HB, text: 'Grandad said the paths stood still for the Turning. Every twelve years, one night, so the procession could find its way. Then the bells rang and the forest let go. (He sniffs.) Tonight it let go of everything.', next: 'stoneq' },
      me: { speaker: HB, text: 'Maybe. Your song’s rot-coloured, pup. Rot’s what moves a forest, in the end. Things fall down and other things grow in the gap. The paths go where the gaps are.', next: 'stoneq' },
      listen: { speaker: 'narrator', text: 'Through the cold stone, faintly, you feel the Thornwilds settling, the way a dog turns three times before it lies down. And far off to the north, in the Rotwood, one place that is not settling at all. It is very still, and very grey, and it is waiting.', next: 'stoneq' },
      stoneq: {
        speaker: HB, text: '(He sets the lantern on the stone’s top and takes out his knife, then puts it away again.) No use re-cutting the stone till we know where things are. Have to walk them. Five old waymarks. Find where they’ve gone.',
        choices: [
          { text: 'I’ll walk them at dawn.', to: 'dawn', trust: 1 },
          { text: 'Why five? There are fifty blazes out there.', to: 'five' },
        ],
      },
      five: { speaker: HB, text: 'The five oldest. My grandad’s grandad cut them. Every other blaze in the Thornwilds is measured off those. Find the five and the rest come right. Mostly.', next: 'dawn' },
      dawn: { speaker: HB, text: 'Dawn, then. Blaze them fresh, pointing where the paths go now. And look about you. Anything wrong out there, I want to know. (A pause.) Anything wrong besides everything.', next: 'joke' },
      joke: {
        speaker: HB, text: '(He picks up the lantern. He looks at you. You can see him thinking it.) A beetle, a boar and a Circle witch…',
        choices: [
          { text: '(Wait for it.)', to: 'owl' },
          { text: 'Holt. It’s the middle of the night.', to: 'night' },
        ],
      },
      owl: { speaker: 'narrator', text: 'Somewhere out in the rearranged forest, a tree falls over with a long, slow, satisfied crash. Holt closes his mouth. “Later,” he says, and goes to bed.', next: null },
      night: { speaker: HB, text: 'Is it. (He sighs.) Later, then. It keeps.', next: null },
    },
  },

  // ======================= I-2 Walk the Ways: the grey place past the fifth waymark
  beat('ranger-blight-clue-1', 'I-2 the grey (1)', stage('quest:ranger-walk-the-ways', 'grey'),
    'Dead Thorn Beetles in the grey bramble, dozens of them, lying on their backs. Dead a week by the dust on them. Nothing is eating them. Not ants, not crows, not the beetles’ own cousins. They are just lying there, as fresh as the day they fell.',
    'ranger.grey_1', 'Grey bramble, brittle as old paper.'),
  beat('ranger-blight-clue-2', 'I-2 the grey (2)', stage('quest:ranger-walk-the-ways', 'grey'),
    'A deer track, clear in the grey dust, walking in. You follow it twenty paces. Then it stops, in the middle of the path, as if the deer stood still and was simply gone. There is a little heap of grey where it stood, like ash that forgot to be warm.',
    'ranger.grey_2', 'A deer track in the grey dust, going in.'),
  beat('ranger-blight-clue-3', 'I-2 the grey (3)', stage('quest:ranger-walk-the-ways', 'grey'),
    'On a dead birch at the heart of the grey, a Wayfarer blaze, fresh: an arrow over three notches, cut deep and wild by a strong hand. Cut upside down. In the Wayfarers’ marks an upside-down blaze means one thing: do not follow.',
    'ranger.reversed_blaze', 'A dead birch with an upside-down blaze.', 'Whoever cut it knew the old marks. And whoever cut it came out of the grey again, because the bootprints go both ways.'),

  // ======================= I-4 The Rotking Returns: out to Aldo’s old plot
  {
    id: 'dialogue:area-ranger-aldo-walk', name: 'I-4 banter: walking Aldo out', bark: true,
    entries: [{ when: stage('quest:ranger-the-rotking-returns', 'walk'), node: 'b' }],
    nodes: { b: { speaker: AM, mood: 'happy', text: 'Listen to it. All that racket. Birds and beetles and Wayfarers shouting. You forget, out in the Rotwood, how loud everything is that isn’t finished yet.', next: null } },
  },
  {
    id: 'dialogue:ranger-aldo-plot', name: 'I-4 Aldo’s old plot', scope: 'party',
    entries: [{ node: 'plot' }],
    nodes: {
      plot: { speaker: 'narrator', text: 'Aldo’s plot, past the edge of camp: thirty years of leeks in rows a hand apart, every row straight as a bowstring. The leeks are still there. They are grey to the root, and standing up perfectly, and they have not grown or rotted in a year.', next: 'leeks' },
      leeks: { speaker: AM, mood: 'happy', text: '(He kneels and touches one, gently, the way you would touch a sleeping child.) Look at that. A year, and not one of them fallen over. They waited for me. Isn’t that loyal? Isn’t that the most loyal thing you ever saw?', next: 'ask' },
      ask: {
        speaker: AM, text: 'Holt would have pulled them up and composted them by now. Holt composts everything. Holt would compost me if I lay still long enough. (He laughs, the big cracked laugh.) Go on. Ask me something. You’ve got a question on you like a burr.',
        choices: [
          { text: 'What happened to you out there, Aldo?', to: 'out' },
          { text: 'Somebody cut a blaze upside down in the grey past the fifth waymark. Deep and wild.', to: 'blaze', when: { flag: 'ranger.reversed_blaze' } },
          { text: 'Why didn’t you come home sooner?', to: 'sooner', trust: 1, trustNpc: AM },
        ],
      },
      out: { speaker: AM, text: 'I went in after a lost Bloomkin, and the path moved, and I couldn’t find my way back, and after a while I stopped wanting to. That’s all. It’s very quiet in the Rotwood. Quiet like a held breath.', next: 'quiet' },
      blaze: { speaker: AM, text: '(He goes on smiling, and does not look up from the leeks.) Did they? Careless. Must have been tired. Upside down means don’t follow, pup. It’s good advice. Nobody ever takes it.', effects: [{ setFlag: 'ranger.aldo_blaze_asked', value: true }], next: 'quiet' },
      sooner: { speaker: AM, mood: 'sad', text: '(For a moment the laugh goes out of him.) Because Holt would have been at the edge of the Rotwood waiting. And I’d have had to explain. You can’t explain quiet to Holt Barrow. He thinks quiet is just him, not talking.', next: 'quiet' },
      quiet: {
        speaker: AM, text: 'Out there you can hear the whole forest falling down, slowly, for miles. Trees, beetles, deer, all of it, coming down together. Nobody fighting it. Nobody shouting. (He stands, knees cracking.) Here. A mushroom. Give it to Holt.',
        choices: [
          { text: '(Take it.)', to: 'take' },
          { text: 'He won’t eat it.', to: 'wont' },
        ],
      },
      take: { speaker: AM, mood: 'happy', text: 'Good pup. Tell him I grew it myself. Tell him it’s the best thing I ever cooked. (He looks back at the grey leeks.) Tell him I’m home.', next: null },
      wont: { speaker: AM, mood: 'happy', text: 'No. He never would eat anything I grew till I’d told him twice. Tell him twice, then. Tell him I’m home. Go on. He’s up the lookout, having his feeling.', next: null },
    },
  },

  // ======================= I-5 The Burning Line: the staked line, Old Cattail
  beat('ranger-firebreak-stake-1', 'I-5 a firebreak stake (1)', stage('quest:ranger-the-burning-line', 'stakes'),
    'The first red flag stands in the Bloomkin nursery-beds, where the newest Bloomkin grow in rows like lettuces, too young yet to walk. Several of them turn their heads to look at the flag. One of them tries to eat it.',
    'ranger.stake_1', 'A red flag on a stick, in the reeds.'),
  beat('ranger-firebreak-stake-2', 'I-5 a firebreak stake (2)', stage('quest:ranger-the-burning-line', 'stakes'),
    'The second red flag stands in the middle of the fen wedding green, where Dilys Marram’s ribbons are still tied to the posts. The line runs straight across it, the way a line drawn on a map in Rootholme runs straight across anything.',
    'ranger.stake_2', 'A red flag on a stick, on the wedding green.'),
  beat('ranger-firebreak-stake-3', 'I-5 a firebreak stake (3)', stage('quest:ranger-the-burning-line', 'stakes'),
    'The last red flag stands at the ferry crossing, and beyond it, up the Rotwood edge, the grey is already in the reeds. A mile a month, the envoy said. Looking at it, you think she may have been kind.',
    'ranger.stakes_walked', 'A red flag on a stick, at the ferry.', 'Both of them are right. That is the worst of it.'),
  {
    id: 'dialogue:ranger-cattail-line', name: 'I-5 Old Cattail before the line', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: OC, text: '(The bulrush bends towards you, very slowly, in no wind at all.) Wayfarer. You have walked the flags. I saw you. I see a great deal, from this height. It is the only advantage of being a bulrush.', next: 'say' },
      say: {
        speaker: OC, text: 'The envoy says the fire is the only way. Perhaps it is. But the Bloomkin were not asked. We were told, very kindly, by a woman with a torch. We have only just woken up, and already people are being kind to us with fire.',
        choices: [
          { text: 'What would the Bloomkin have me do?', to: 'do' },
          { text: 'If the blight reaches Rootholme, the city dies.', to: 'city' },
        ],
      },
      do: { speaker: OC, text: 'We do not know. That is the honest answer. We would like to be asked anyway. A people that is asked can be wrong. A people that is told can only be burned or not.', choices: more(offer('quest:ranger-the-bloomkin-census', 'Would you like to be counted first?', 'count')) },
      city: { speaker: OC, mood: 'sad', text: 'Yes. I know. The city is very old, and we are very new, and old things are always more important to the people who are old. (It sways.) I am not angry. Bulrushes do not have the stalk for it.', choices: more(offer('quest:ranger-the-bloomkin-census', 'Would you like to be counted first?', 'count')) },
      count: { speaker: OC, mood: 'happy', text: 'Yes. Oh, yes. Four clumps of us, round the fen. If we know how many we are, we will know how loud to be. Count quickly. They wander.', next: null },
    },
  },

  // ======================= I-6 The Beetle Mound: the hollow eggs (one per Mound chamber)
  beat('ranger-hollow-egg-1', 'I-6 an egg-clutch (1)', stage('quest:ranger-the-beetle-mound', 'eggs'),
    'A clutch of beetle eggs in a lacquered cell, each as big as your fist, glossy and black. You tap one. It rings, hollow as a bell. There is nothing inside it at all. The Queen has been laying, and laying, and nothing is growing in them.',
    'ranger.egg_1', 'An empty cell of black lacquer.'),
  beat('ranger-hollow-egg-2', 'I-6 an egg-clutch (2)', stage('quest:ranger-the-beetle-mound', 'eggs'),
    'A clutch that has hatched. The hatchlings are grey, and the size of rats, and they are eating the walls of the Mound, which is made of green living wood the beetles carried in. They chew and chew and get no bigger.',
    'ranger.egg_2', 'Gnawed green wood in a beetle cell.'),
  beat('ranger-hollow-egg-3', 'I-6 an egg-clutch (3)', stage('quest:ranger-the-beetle-mound', 'eggs'),
    'The last clutch lies in a bed of grey fluff, not beetle-make. Fungus. It has been laid down under the eggs like straw in a nest, carefully, in a ring. Somebody made this bed for them. The eggs on it are the most hollow of all.',
    'ranger.egg_3', 'A ring of grey fluff, scattered.', 'Deeper in, the humming of the Mound changes key. She knows you are here.'),

  // ======================= I-7 The Rotking’s Crown: Aldo’s blazes into the Rotwood
  beat('ranger-aldo-trail-1', 'I-7 Aldo’s trail (1)', stage('quest:ranger-the-rotkings-crown', 'trail'),
    'The first blaze at the Rotwood’s edge, on a green oak: neat and careful, an arrow over three notches, cut the old way, exactly as Holt taught every child in the camp. Aldo was taught by Holt’s grandad. He cut it like a good boy.',
    'ranger.trail_1', 'A neat blaze on a green oak at the Rotwood’s edge.'),
  beat('ranger-aldo-trail-2', 'I-7 Aldo’s trail (2)', stage('quest:ranger-the-rotkings-crown', 'trail'),
    'Deeper, on a grey ash, the second blaze: the same arrow, but the notches have grown. Five, six, eight of them, cut over and over in a row, as if he was counting something and could not stop. Under it, small: “listen”.',
    'ranger.trail_2', 'A grey ash with a row of notches.'),
  beat('ranger-aldo-trail-3', 'I-7 Aldo’s trail (3)', stage('quest:ranger-the-rotkings-crown', 'trail'),
    'The third blaze is not cut at all. It is grown: a ring of grey shelf-fungus coaxed out of the bark in the shape of an arrow, pointing on, towards the Rotting Glade. It is beautiful. It is the most beautiful blaze you have ever seen, and nothing round it is alive.',
    'ranger.trail_3', 'An arrow of grey shelf-fungus on a dead trunk.'),
  {
    id: 'dialogue:area-ranger-rotwood-trail', name: 'I-7 banter: into the Rotwood', bark: true,
    entries: [{ when: stage('quest:ranger-the-rotkings-crown', 'rotwood'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'It is very quiet in the Rotwood. Not the quiet of a sleeping forest. The quiet of a room where everybody has stopped talking because you came in.', next: null } },
  },

  // ======================= I-9 The Last Waymark: the Blaze Oak (codex find)
  {
    id: 'dialogue:obj-ranger-first-blaze', name: 'I-9 the Blaze Oak', scope: 'party',
    entries: [{ when: stage('quest:ranger-the-last-waymark', 'blaze'), node: 'oak' }, { node: 'plain' }],
    nodes: {
      oak: { speaker: 'narrator', text: 'The Blaze Oak stands where the Wayfarers’ road leaves the Thornwilds for the Thorn Gate: a great old tree cut all over, from root to as high as a tall Wayfarer can reach, with blazes. Every one is somebody’s first, cut on the way out into the world.', next: 'names' },
      names: { speaker: 'narrator', text: 'They are all different. Each Wayfarer makes the mark their own: a fox on the arrow, a flower, a tiny crown. Low down, two boys’ marks side by side, H and A, the A cut first. The newest blaze is thirty years old, and weathered grey.', next: 'cut' },
      cut: {
        speaker: 'narrator', text: 'Your half-stone hums. You take out your knife.',
        choices: [
          { text: '(Cut the arrow and three notches, plain and clean, the old way.)', to: 'plain2', effects: [{ unlockLore: 'lore:hc-ranger-blaze-oak' }] },
          { text: '(Cut the arrow, and put something of your own on it.)', to: 'own', effects: [{ unlockLore: 'lore:hc-ranger-blaze-oak' }] },
        ],
      },
      plain2: { speaker: 'narrator', text: 'Arrow, three notches. Pale and new among the grey. The oak shivers once, all the way up, and drops a single acorn on your head, which Holt would say is a blessing and Aldo would say is a joke.', next: null },
      own: { speaker: 'narrator', text: 'Arrow, three notches, and beside it a small mark that is only yours. When you step back it looks as if it has always been there. Somebody, some day, will come up this road and see it and know you went this way.', next: null },
      plain: { speaker: 'narrator', text: 'The Blaze Oak, cut with a thousand first blazes. Yours is the newest.', next: null },
    },
  },
  {
    id: 'dialogue:area-ranger-gate-road', name: 'I-9 banter: the gate road', bark: true,
    entries: [
      { when: { all: [stage('quest:ranger-the-last-waymark', 'road'), { flag: 'ranger.holt_walks' }] }, node: 'holt' },
      { when: stage('quest:ranger-the-last-waymark', 'road'), node: 'alone' },
    ],
    nodes: {
      holt: { speaker: HB, text: '(Walking beside you, pack on, not looking at you.) Roots get thick past the next bend. Stay behind me. Don’t argue. (You were not going to.)', next: null },
      alone: { speaker: 'narrator', text: 'The road to the gate is soft underfoot, and the leaf-mould on it is churned as if something large went this way underneath it, recently, laughing.', next: null },
    },
  },

  // ======================= Side: the Salt Thief (the hoard)
  {
    id: 'dialogue:obj-ranger-salt-hoard', name: 'The Salt Thief: the hoard', scope: 'party',
    entries: [{ when: stage('quest:ranger-the-salt-thief', 'hoard'), node: 'oak' }, { node: 'plain' }],
    nodes: {
      oak: { speaker: 'narrator', text: 'Out past the camp, a hollow oak. The squirrel leaps out of your pack, runs up the trunk, and sits in a knot-hole looking smug. You look inside. The oak is white to the roots. Packed solid, dry and clean: eleven years of salt.', next: 'more' },
      more: {
        speaker: 'narrator', text: 'Neatly sorted, too. Coarse salt at the bottom, fine salt on top, and a little ledge of the good grey salt Dunmore buys from the pedlars for feast days. The squirrel has been keeping the camp’s salt better than the camp ever did.',
        choices: [
          { text: '(Fill your pack for Dunmore.)', to: 'fill', effects: [{ setFlag: 'ranger.salt_hoard', value: true }] },
          { text: '(Leave it. It’s the squirrel’s winter.)', to: 'leave', effects: [{ setFlag: 'ranger.salt_hoard', value: true }] },
        ],
      },
      fill: { speaker: 'narrator', text: 'You fill your pack. The squirrel watches every handful, and when you stop, it jumps back into the pack on top of the salt and goes to sleep, satisfied, as if this were the plan all along.', next: null },
      leave: { speaker: 'narrator', text: 'You take one pinch, for Dunmore to see, and leave the rest. The squirrel considers you for a long time. Then it jumps back into your pack and goes to sleep, which you decide to take as thanks.', next: null },
      plain: { speaker: 'narrator', text: 'A hollow oak, white inside with salt.', next: null },
    },
  },

  // ======================= Side: Names on the Tree (Kit’s last blazes)
  beat('ranger-kit-last-blaze', 'Names on the Tree: Kit’s last blazes', stage('quest:ranger-names-on-the-tree', 'way'),
    'Kit’s blazes go on from the holly, one tree to the next, each with a little fox burned beside it. They curve, carefully, all the way round a stretch of grey bramble you would have walked straight into. She saw the blight in the spring, before anyone, and marked the way round it.',
    'ranger.kits_way', 'A fox-marked blaze on a tree.', 'The last fox is cut on a tree at the edge of the grey, facing back towards the camp. She was coming home to tell them. She did not get there.'),

  // ======================= Side: the Path That Likes Him (Cobb’s stall)
  {
    id: 'dialogue:ranger-cobb-stall', name: 'The Path That Likes Him: Cobb’s stall', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: CT, mood: 'happy', text: 'Pins! Ribbons! Needles! A very good teapot, one only, do not ask the price! (He has laid his wares out on a cloth by the camp gate, and the Wayfarers are already crowding round.) Look at that. Customers. Four days I dreamed of customers.', next: 'look' },
      look: {
        speaker: 'narrator', text: 'Behind Cobb, where the Thornwilds come up to the camp, there is a path that was not there this morning: narrow, new, trodden flat, running all the way back into the bramble towards a tree called Gerald.',
        choices: [
          { text: 'Cobb. Look behind you.', to: 'behind' },
          { text: '(Crouch and lay a hand on the new path.)', to: 'hand', school: 'verdant' },
        ],
      },
      behind: { speaker: CT, text: '(He turns. He stares. He goes very pink.) It followed me home. (Holt, passing, looks at it for a long moment and says, “Hm. Mark it on the stone.”) It’s on the MAP. My path is on the map.', next: 'end' },
      hand: { speaker: 'narrator', text: 'The new path is warm under your hand, and very slightly smug, like a dog that has been told to stay and has come anyway. It is not going to move. You have the distinct feeling it has found where it wants to be.', next: 'end' },
      end: { speaker: CT, mood: 'happy', text: 'Every spring. I’ll come every spring, along my own path, and set up right here. Have a ribbon. Have two. (He presses them on you.) And thank Gerald for me, if you’re passing.', effects: [{ setFlag: 'ranger.cobb_path', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:ranger-cobb-after', name: 'Cobb Tinsley (at his pitch)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: CT, mood: 'happy', text: 'Sold eleven pins and a ribbon to Holt Barrow, who claims it’s for a knife-handle. It is not for a knife-handle. (He leans in.) The path brings me a fresh cup of dew every morning. Well. Puddles. Near enough.', next: null } },
  },

  // ======================= Side: the Still Tune (the Wandering Ford)
  {
    id: 'dialogue:obj-ranger-ford-stone', name: 'The Still Tune: the Wandering Ford', scope: 'party',
    entries: [{ when: stage('quest:ranger-the-still-tune', 'ford'), node: 'ford' }, { node: 'plain' }],
    nodes: {
      ford: { speaker: 'narrator', text: 'The Wandering Ford, where the trail to the Bloomfen crosses a slow brown stream. As you watch, the stepping-stones shuffle a pace downstream, then two paces up, like people who cannot agree where to stand for a portrait. A supply cart waits on the bank, its driver asleep.', next: 'play' },
      play: {
        speaker: 'narrator', text: 'You stand on the flat stone at the edge where the fiddlers used to stand, and you take a breath.',
        choices: [
          { text: '(Hum the Still Tune, all three phrases.)', to: 'hum' },
          { text: '(Whistle it. You never could hum.)', to: 'whistle' },
        ],
      },
      hum: { speaker: 'narrator', text: 'Slow and stepping, down like someone settling into a chair, up and back, and the long held note. The stones stop shuffling. The stream itself seems to slow. The driver wakes, sees the ford standing still for the first time in thirty years, and drives across at a gallop.', effects: [{ setFlag: 'ranger.still_tune', value: true }], next: 'after' },
      whistle: { speaker: 'narrator', text: 'It comes out thin, and a bit flat, and the stones do not care. They stop dead in a line, waiting. The driver wakes, stares, and drives across at a gallop, shouting thanks over his shoulder in a voice that suggests he has been waiting there since spring.', effects: [{ setFlag: 'ranger.still_tune', value: true }], next: 'after' },
      after: { speaker: 'narrator', text: 'When the last note goes, the stones give a little shake, as if waking, and wander off downstream again. But on the bank someone has already begun chalking the notes on the big flat stone, for whoever comes next.', next: null },
      plain: { speaker: 'narrator', text: 'The Wandering Ford. Three phrases of a tune are chalked on the flat stone at the edge.', next: null },
    },
  },

  // ======================= Side: Lilies for a Wedding (the groom)
  {
    id: 'dialogue:obj-ranger-wedding-groom', name: 'Lilies for a Wedding: the groom on the island', scope: 'party',
    entries: [{ when: stage('quest:ranger-lilies-for-a-wedding', 'groom'), node: 'island' }, { node: 'plain' }],
    nodes: {
      island: { speaker: 'narrator', text: 'On the reed island in the middle of the fen, a young man in his best coat is sitting in a beached punt, saying things to a frog. “I, Osier Sedge, take thee, Dilys, for my… wife, and my… life, and my… the frog is looking at me.” The frog is looking at him.', next: 'vows' },
      vows: {
        speaker: 'narrator', text: '“Everything rhymes,” says Osier, in the voice of a man about to be sick. “I wrote my vows and everything I wrote rhymes. Wife, life. Fen, then. Dilys, lilies. She’ll laugh. Everyone will laugh. Ezra will put it in his speech.”',
        choices: [
          { text: 'Then say it plain. Say what you’d say if nobody was listening.', to: 'plain2', effects: [{ setFlag: 'ranger.groom_vows', value: 'plain' }] },
          { text: 'Let them laugh. She’s marrying you, not your rhymes.', to: 'laugh', effects: [{ setFlag: 'ranger.groom_vows', value: 'rhyme' }] },
        ],
      },
      plain2: { speaker: 'narrator', text: 'Osier thinks about it. Then, to the frog, quite quietly: “I’ll keep the fire in. I’ll mend the punt. I’ll be there when you get back.” He looks up. “That doesn’t rhyme.” No, you say. It doesn’t. He gets in the punt.', next: null },
      laugh: { speaker: 'narrator', text: '“She does like a laugh,” Osier says slowly. “She laughed when Ezra fell in the Bloomtrap. She laughed for an hour.” He stands up in the punt, which wobbles. “Wife and life it is.” He rows for the shore like a man going to war.', next: null },
      plain: { speaker: 'narrator', text: 'A reed island, and a frog that has seen things.', next: null },
    },
  },

  // ======================= Side: the Bloomkin Census (Old Pennyroyal)
  {
    id: 'dialogue:obj-ranger-water-mint', name: 'The Bloomkin Census: Old Pennyroyal', scope: 'party',
    entries: [{ when: stage('quest:ranger-the-bloomkin-census', 'mint'), node: 'mint' }, { node: 'plain' }],
    nodes: {
      mint: { speaker: 'narrator', text: 'Old Pennyroyal sits alone on its stone, a water-mint Bloomkin as grey-green and crinkled as an old leaf, smelling sharply of mint. It opens one eye. “Seventy-seven,” it says, before you have asked anything. “I was counted wrong.”', next: 'how' },
      how: {
        speaker: 'narrator', text: '“The young ones woke when the tree went mad. Thirty years. I woke before. Long before. I woke the spring the procession came through the fen, with the Stone on a cushion, singing.”',
        choices: [
          { text: '“There were Bloomkin before the Hollowing?”', to: 'before' },
          { text: '“What happened to them?”', to: 'happened' },
        ],
      },
      before: { speaker: 'narrator', text: '“A few. One every Turning, maybe. The Stone woke us as it passed, and in the autumn we went to sleep, like sensible plants, and in the spring we woke again. Seventy-seven springs I’ve woken.” It sniffs. “Thirty of them without a winter first.”', next: 'winter' },
      happened: { speaker: 'narrator', text: '“They slept. In the autumn, every year, the way a plant should. Only the sleep got longer, and one autumn they didn’t wake, and that was right too. That was honest.” It sniffs. “The young ones have never slept at all.”', next: 'winter' },
      winter: { speaker: 'narrator', text: '“Tell Cattail. Tell him there’s nothing to be afraid of in the dark under the leaves. Something always comes up after. Something always did, when the rot was honest.” It shuts its eye again. “Seventy-seven. Write it down.”', effects: [{ unlockLore: 'lore:hc-ranger-old-pennyroyal' }, { insight: 'ranger_old_rot' }], next: null },
      plain: { speaker: 'narrator', text: 'Old Pennyroyal, on its stone, asleep, and smelling of mint.', next: null },
    },
  },

  // ======================= Side: the House Is Just Old (the edge of the Rotwood)
  {
    id: 'dialogue:ranger-bram-edge', name: 'The House Is Just Old: the edge of the Rotwood', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BH, text: '(He sits down on the stump with a noise like a door, and puts his one thing on his knees.) There. Green. Haven’t sat in green for a year. (He looks back at the grey behind him.) Funny. I can’t think where to go now.', next: 'where' },
      where: {
        speaker: BH, mood: 'sad', text: 'Our Peg married into the Bloomfen, years back. Married a Marram. We had words about it, her mother and me and her. Haven’t spoken since. Daft. Fifty years of chopping trees and I couldn’t cut one sentence short.',
        choices: [
          { text: 'There’s a Marram wedding in the Bloomfen. Dilys Marram.', to: 'dilys', when: { any: [{ questActive: 'quest:ranger-lilies-for-a-wedding' }, { questCompleted: 'quest:ranger-lilies-for-a-wedding' }] }, effects: [{ setFlag: 'ranger.bram_home', value: 'wedding' }] },
          { text: 'Come back to Wayfarer’s Rest. There’s always room at the fire.', to: 'rest', effects: [{ setFlag: 'ranger.bram_home', value: 'rest' }] },
          { text: 'Go and see Peg, Bram. Before it gets any later.', to: 'peg', trust: 1, effects: [{ setFlag: 'ranger.bram_home', value: 'peg' }] },
        ],
      },
      dilys: { speaker: BH, text: 'Dilys. (He says it like a word he hasn’t used in a long time.) Peg’s girl. She’d be… she’d be getting married about now. (He stands up, knees and all.) I’ve got a jug. A horse. An axe. Something. She can have whichever I’ve got.', next: 'end' },
      rest: { speaker: BH, text: 'Room at the fire. (He nods slowly.) Aye. That’s a start. An old woodcutter’s good for kindling, if nothing else. And from the Rest it’s not far to the Bloomfen. Not far at all, if a man had the nerve.', next: 'end' },
      peg: { speaker: BH, mood: 'sad', text: 'Before it gets any later. (He looks at you for a long time.) You sound like her mother. All right. All right. The Bloomfen’s that way. I’ll take the long road, mind. Give myself time to think what to say.', next: 'end' },
      end: { speaker: BH, text: 'Thank you, Wayfarer. For walking me out. A house can go back to the wood honest. A man ought to manage the same, given a stump and a bit of sun.', next: null },
    },
  },

  // ======================= Side: Mushroom Supper (the Old Rot test)
  {
    id: 'dialogue:obj-ranger-morel-test', name: 'Mushroom Supper: the Old Rot will not eat it', scope: 'party',
    entries: [{ when: stage('quest:ranger-mushroom-supper', 'test'), node: 'lay' }, { node: 'plain' }],
    nodes: {
      lay: { speaker: 'narrator', text: 'You lay one of Aldo’s pale mushrooms on the soft dark wood of the Old Rot, among the ferns and beetles and little shelf-fungi. Then you sit back and wait, the way Holt waits: without saying anything, for a long time.', next: 'wait' },
      wait: { speaker: 'narrator', text: 'The beetles come up to it, and stop, and go round. A woodlouse touches it with one feeler and turns back. The threads of honest mould that reach into everything on the log reach towards it, and curl away. Nothing in the Old Rot will touch it.', next: 'know' },
      know: {
        speaker: 'narrator', text: 'Rot eats what has finished living. The oldest rot in the Thornwilds will not eat this.',
        choices: [{ text: '(It was never alive. It only looks like it.)', to: 'end', insight: 'ranger_dead_blight', effects: [{ setFlag: 'ranger.morel_test', value: true }] }],
      },
      end: { speaker: 'narrator', text: 'You wrap it in a dock leaf, carefully, and put it away for Sister Morel. The Old Rot goes on with its thousand-year supper, and does not look at your pack.', next: null },
      plain: { speaker: 'narrator', text: 'The Old Rot, feeding its grove.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in the Thornwilds’ ruin, cave and viewpoint
  find('verdant-frontier-ruin-find', 'Thornwilds ruin: the first Rest',
    'In the ruin, among the posts of a camp so old the posts have rotted to stumps, an iron cooking pot hangs on a tripod, and in it, wrapped in oilcloth, a note: “Paths moved in the night. The whole camp is going after them. If you are reading this, we went north. Follow the blazes.” There are no blazes left to follow.',
    'lore:hc-verdant-frontier-ruin'),
  find('verdant-frontier-cave-find', 'Thornwilds cave: the blaze-key',
    'At the end of the cave the Wayfarers have cut a key to their marks into the wall, for apprentices: arrow over three notches, this way. Arrow and circle, water. Arrow and cross, danger. And at the bottom, deepest of all, the arrow turned upside down: do not follow. Nobody has ever needed to cut that one, says a note in chalk. Yet.',
    'lore:hc-verdant-frontier-cave'),
  find('verdant-frontier-cave-codex', 'The Blaze Cellar: a Wayfarer’s letter',
    'A letter in a tin on a ledge, in a careful hand: “To my boy. Storm caught me, so I am in the Blaze Cellar until it passes, and I have been cutting you a whistle. If the path moves before I get back, follow the fox marks. I always cut a fox for you. Your mam, Nell Rennet.”',
    'lore:hc-verdant-frontier-letter'),
  find('verdant-frontier-view-find', 'Thornwilds viewpoint: the moving ways',
    'From the viewpoint the whole Thornwilds lies open, and if you are patient, you can watch it move: a path sliding sideways like a snake in the grass, a clearing drifting a few paces east. Somebody has cut nine notches in the rail, one for every path, and under them: “All nine still moving. C. 1041.”',
    'lore:hc-verdant-frontier-view'),
  {
    id: 'dialogue:area-verdant-frontier-view', name: 'Thornwilds viewpoint banter',
    bark: true, entries: [{ when: { heroClass: 'ranger' }, node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'From up here you can see Wayfarer’s Rest, the smoke from Dunmore’s fire, and one very small red dot moving about on the cook-tent roof. The squirrel, presumably. Visiting.', next: null } },
  },
  // ======================= ACT II, C-1 The Hedge House: the road in, the Wayfarers’ loft
  {
    id: 'dialogue:area-ranger-briar-road', name: 'C-1 banter: the road to Briar Hollow', bark: true,
    entries: [{ when: stage(RC1, 'hedge'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Concordia’s paths stay exactly where they are put. Your feet keep waiting for the ground to slide sideways, the way it does at home, and it keeps not doing it. It is very unsettling.', next: null } },
  },
  {
    id: 'dialogue:obj-ranger-hedge-loft', name: 'C-1 the Wayfarers’ loft', scope: 'party',
    entries: [{ when: stage(RC1, 'loft'), node: 'loft' }, { node: 'plain' }],
    nodes: {
      loft: { speaker: 'narrator', text: 'Up a ladder, through a hatch, into the Wayfarers’ loft. Bunks along both walls, rebuilt and rebuilt for a thousand Turnings. The bats hang from the rafters in a polite row and look at you as if you are late.', next: 'names' },
      names: {
        speaker: 'narrator', text: 'Every bedpost is cut with names and dates, the way a Wayfarer cuts a blaze: I slept this far. Fernsbys, Fitches, a Mire. On the post by the hatch, “T. BARROW, C. 988”, and below it, smaller, “N. RENNET, and her boy”.',
        choices: [
          { text: '(Look at the beam above Tobin Barrow’s bunk.)', to: 'beam' },
          { text: '(Cut your own name into the post.)', to: 'cut' },
          { text: '(Lie down on the old bunk and listen to the wood.)', to: 'listen', school: 'verdant' },
        ],
      },
      cut: { speaker: 'narrator', text: 'You cut your name below Tobin’s, the first new name in thirty years. A bat comes down to inspect it, approves, and goes back up.', next: 'beam' },
      listen: { speaker: 'narrator', text: 'Old wood remembers weight. These bunks remember a thousand Turnings of tired Wayfarers, and somewhere deep in the grain, very faintly, somebody is snoring.', next: 'beam' },
      beam: { speaker: 'narrator', mood: 'happy', text: 'On the beam above Tobin’s bunk, in carpenter’s pencil: “Ladder going home with me. Nan will understand. She won’t. T. B.”', effects: [{ setFlag: 'ranger.tobin_note', value: true }], next: 'teasel' },
      teasel: { speaker: TG, text: '(From the foot of the ladder.) Found the beam, have you? Don’t tell Nan. No. Do tell Nan. I should like to see her face.', next: null },
      plain: { speaker: 'narrator', text: 'The Wayfarers’ loft, full of bunks and polite bats.', next: null },
    },
  },

  // ======================= ACT II, C-2 Stag’s Rest: the old ways, rot that feeds nobody
  {
    id: 'dialogue:area-ranger-gloam-ways', name: 'C-2 banter: the old Wayfarer ways', bark: true,
    entries: [{ when: stage(RC2, 'ways'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The old blazes are a hundred years faded and cut by your own people. Every one is a hand on your shoulder: this way, Wayfarer. Somebody walked this far. Somebody always walked this far.', next: null } },
  },
  {
    id: 'dialogue:obj-ranger-willow-log', name: 'C-2 a fallen log at Stag’s Rest', scope: 'party',
    entries: [{ when: stage(RC2, 'log'), node: 'log' }, { node: 'plain' }],
    nodes: {
      log: { speaker: 'narrator', text: 'A fallen Gloamwood oak at the foot of Stag’s Rest, grey to the heart. You kick it open, the way Holt taught you. Rot tells you who has been eating.', next: 'inside' },
      inside: {
        speaker: 'narrator', text: 'Nobody has been eating. No beetles, no grubs, no white threads of mould, not even a woodlouse. The wood is soft and grey and perfectly, horribly clean. It has been falling apart for thirty years and feeding no one.',
        choices: [
          { text: '(Taste a crumb of it, Wayfarer fashion.)', to: 'taste' },
          { text: '(Hold the Rot half to it.)', to: 'half', school: 'verdant' },
          { text: '(Kick it again, to be sure.)', to: 'kick' },
        ],
      },
      taste: { speaker: 'narrator', text: 'It tastes of nothing at all. Honest rot tastes of mushrooms and rain. This tastes like a held breath.', next: 'end' },
      half: { speaker: 'narrator', text: 'The Rot half hums low and brown. One white thread of honest mould creeps out across the grey, reaching, and then it shrivels, as if the wood had slapped its hand away.', next: 'end' },
      kick: { speaker: 'narrator', text: 'A second kick. A puff of grey dust. Still nothing. Up on the hill, the Willow weeps a little louder, as if it heard.', next: 'end' },
      end: { speaker: 'narrator', text: 'Rot that feeds nobody. The Willow is holding everything in: its leaves, its tears, its dead. Nothing at Stag’s Rest is allowed to finish.', effects: [{ setFlag: 'ranger.willow_rot_read', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'A fallen oak at Stag’s Rest, kicked open.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Rotking’s Trail: Teasel on the glade road
  {
    id: 'dialogue:ranger-teasel-camp', name: 'C-4 Teasel and the Verdant pot', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TG, text: '(He is sitting on an upturned pot by a little fire, in his best hat.) There you are. Nan said walk, so I walked. Nan says a great many things. She’s usually right, which is the worst thing about her.', next: 'pot' },
      pot: { speaker: TG, text: '(He pats the pot.) This is the Verdant pot. Every Turning the Verdant party carried a cutting of the Elder Tree to the Concordant’s garden, and somebody had to carry the pot. In ’12, that was me.', next: 'stag' },
      stag: {
        speaker: TG, mood: 'sad', text: 'The White Stag walked in front of us all the way from the Gloamwood to the Citadel, like it always did. Then the arches shut, and we came out of the Heart, and it was still at the glade, waiting for us to come back by. I never went to look.',
        choices: [
          { text: 'Why not?', to: 'why' },
          { text: 'Will it know you?', to: 'know' },
          { text: 'You don’t have to come in, Teasel.', to: 'stay', trust: 1 },
        ],
      },
      why: { speaker: TG, text: 'Ashamed, I suppose. We were the procession, and we didn’t come back. (He turns his hat round in his hands.) Thirty years is a long time not to go and look.', next: 'go' },
      know: { speaker: TG, text: 'I had more hair. But I’ve still got the pot, and the pot smells of home, and stags have very good noses.', next: 'go' },
      stay: { speaker: TG, text: 'Yes, I do. Somebody from the procession ought to turn up, even late. Especially late.', next: 'go' },
      go: { speaker: TG, text: 'Take me in, Wayfarer. Not fast, mind. My knees are Concordian now.', next: null },
    },
  },

  // ======================= ACT II, C-5 The White Stag: what Teasel sees
  {
    id: 'dialogue:ranger-teasel-stag', name: 'C-5 Teasel at the edge of the Stag’s glade', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'At the edge of the glade Teasel takes his hat off. Across the grey grass the White Stag lifts its head, very slowly, black tears still running, and looks at him for a long time.', next: 'late' },
      late: { speaker: TG, text: '(Quietly.) It’s me. The pot. Sorry we’re late.', next: 'ears' },
      ears: {
        speaker: 'narrator', text: 'The Stag does not move. But it stops weeping for the length of one breath, and its ears come forward.',
        choices: [
          { text: 'What do you see, Teasel?', to: 'see' },
          { text: '(Look at the grey round its hooves.)', to: 'rows', school: 'verdant' },
        ],
      },
      see: { speaker: TG, text: 'Grief. Honest grief. That’s how my mother looked at the door when Dad didn’t come home off the boats. It isn’t sick. It’s waiting, and it’s worn out with waiting.', next: 'aldo' },
      rows: { speaker: 'narrator', text: 'Round its hooves Aldo’s grey fungus stands in neat rows, every cap turned towards the Stag like a sunflower to the sun, drinking. The grief is honest. What is feeding on it isn’t.', next: 'aldo' },
      aldo: {
        speaker: TG, text: 'And something’s drinking it. That big laughing man of yours, I expect. (He puts his hat back on.) Go on. I’ll stand here, so it has somebody from the procession to look at while you work.',
        choices: [{ text: 'Stay well back, Teasel.', to: 'end', quest: true }, { text: 'Thank you for coming.', to: 'end', quest: true }],
      },
      end: { speaker: TG, text: 'Mind its antlers. It doesn’t know yet that it’s finished waiting.', next: null },
    },
  },

  // ======================= ACT II, C-6 Holt’s Blaze: the answer
  {
    id: 'dialogue:obj-ranger-reply-blaze', name: 'C-6 your answer beside Holt’s blaze', scope: 'party',
    entries: [{ when: stage(RC6, 'reply'), node: 'blaze' }, { node: 'plain' }],
    nodes: {
      blaze: { speaker: 'narrator', text: 'Back at the Verdant arch, Holt’s blaze is still white where the knife went in: an arrow over three notches, and the old sign for “I walked this far”. The stone beside it is bare, and waiting.', next: 'cut' },
      cut: {
        speaker: 'narrator', text: 'Holt doesn’t write. Neither will you. What do you cut?',
        choices: [
          { text: '(An arrow over three notches, and the sign for “further”.)', to: 'further', effects: [{ setFlag: 'ranger.reply', value: 'further' }] },
          { text: '(The sign for a debt owed, and under it: “N. B. ONE LADDER.”)', to: 'ladder', effects: [{ setFlag: 'ranger.reply', value: 'ladder' }] },
          { text: '(The start of a joke: “A beetle, a boar…”)', to: 'joke', when: { flag: 'ranger.holt_devotable' }, effects: [{ setFlag: 'ranger.reply', value: 'joke' }] },
        ],
      },
      further: { speaker: 'narrator', text: 'You cut it deep, so it will last. The next one through will read it: a Wayfarer walked this far, and the next one walked further.', next: null },
      ladder: { speaker: 'narrator', mood: 'happy', text: 'You cut it neatly. Sooner or later Holt Barrow will come back to the gate, read it, say “Hm,” and go home and look at his lookout ladder for a very long time.', next: null },
      joke: { speaker: 'narrator', mood: 'happy', text: 'You cut the first half and leave the rest of the stone blank. He’ll know. He’ll be furious. He’ll be delighted.', next: null },
      plain: { speaker: 'narrator', text: 'Two Wayfarer blazes on the Verdant arch, side by side.', next: null },
    },
  },

  // ======================= ACT III, Holt’s Last Blaze: the stone won’t take it; honest rot
  {
    id: 'dialogue:obj-ranger-stair-foot', name: 'Holt’s Last Blaze: the foot of the Stairs', scope: 'party',
    entries: [{ when: stage(LAST, 'foot'), node: 'foot' }, { node: 'plain' }],
    nodes: {
      foot: {
        speaker: 'narrator', text: 'At the foot of the Twelve Stairs, where a Wayfarer marks the start of a road, you set your knife to the black stone. It skates off with a squeal like a gull. Not a scratch.',
        choices: [
          { text: '(Try again, harder.)', to: 'harder' },
          { text: '(Feel the stone the way you would feel bark.)', to: 'feel', school: 'verdant' },
        ],
      },
      harder: { speaker: 'narrator', text: 'The tip of the knife snaps off and goes ringing away down the steps. The stone is unmarked. Somewhere a very long way off, Holt Barrow is saying “Hm.”', next: 'think' },
      feel: { speaker: 'narrator', text: 'No grain. No give. Nothing has ever lived in it, so nothing has ever softened it. A blaze goes in where the wood is soft, Holt always said.', next: 'think' },
      think: { speaker: 'narrator', text: 'Rot softens everything in the end. That is what it is for. And there is honest rot in the Heart: by your bedroll at the camp, where the Rot half lies each night.', effects: [{ setFlag: 'ranger.stair_tried', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The foot of the Twelve Stairs. There is a small white scratch on the black stone now.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ranger-bedroll-rot', name: 'Holt’s Last Blaze: honest rot by the bedroll', scope: 'party',
    entries: [{ when: stage(LAST, 'rot'), node: 'rot' }, { node: 'plain' }],
    nodes: {
      rot: {
        speaker: 'narrator', text: 'By your bedroll the black ground has gone soft and brown, a hand’s width all round the place where the Rot half sleeps. Honest rot. It smells of rain and bread, and there is a woodlouse in it, looking pleased with itself.',
        choices: [
          { text: '(Wipe the blade through it until it smells of leaf-mould.)', to: 'rag' },
          { text: '(Ask the half to sing to it first.)', to: 'sing', school: 'verdant' },
        ],
      },
      sing: { speaker: 'narrator', text: 'The Rot half sings low and brown, and while you watch the patch spreads a finger’s width further into the black. The woodlouse is delighted.', next: 'rag' },
      rag: { speaker: 'narrator', text: 'You work a handful into a rag and wipe the blade through it until the steel smells of leaf-mould. Holt never said rot could get into stone. He never said it couldn’t, either.', effects: [{ setFlag: 'ranger.knife_rotted', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Honest rot by your bedroll, and a woodlouse.', next: null },
    },
  },

  // ======================= ACT III, Aldo’s Garden: the bell, and where he sat
  {
    id: 'dialogue:obj-ranger-aldo-bell', name: 'Aldo’s Garden: the hollow bell', scope: 'party',
    entries: [{ when: stage(GARDEN, 'bell'), node: 'bell' }, { node: 'plain' }],
    nodes: {
      bell: { speaker: 'narrator', text: 'Aldo’s bell lies at the foot of the Twelve Stairs, where it rolled: tonk, tonk, tonk, all the way down. It is only a hollow log, really, with a knot for a clapper. Somebody carved it by a fire, long ago.', next: 'names' },
      names: {
        speaker: 'narrator', text: 'Cut on the inside, where only the ringer would see it: two sets of initials, “H. B.” and “A. M.”, and a year, C. 1001. Two boys, one knife and a whole winter.',
        choices: [
          { text: '(Ring it once.)', to: 'ring' },
          { text: '(Take it. Mushrooms grow honestly in hollow wood.)', to: 'take' },
        ],
      },
      ring: { speaker: 'narrator', mood: 'happy', text: 'It goes tonk. Just tonk. It sounds like a woodpecker with a cold. You can see why he liked it.', next: 'take' },
      take: { speaker: 'narrator', text: 'It is honest wood, half rotten already, the good way. It will do for a garden bed.', effects: [{ setFlag: 'ranger.aldo_bell', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The foot of the Twelve Stairs, where Aldo’s bell came to rest.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ranger-aldo-crack', name: 'Aldo’s Garden: where he sat', scope: 'party',
    entries: [
      { when: { all: [stage(GARDEN, 'crack'), { flag: 'ranger.nemesis_fate', op: '==', value: 'spared' }] }, node: 'spared' },
      { when: stage(GARDEN, 'crack'), node: 'fell' },
      { node: 'plain' },
    ],
    nodes: {
      spared: { speaker: 'narrator', text: 'Aldo climbs the Stairs beside you, puffing, in his borrowed blanket, carrying his bell with the brown cap growing out of it. He sets it down in the crack where he sat as the Herald, and looks at it for a long while.', next: 'ring' },
      ring: { speaker: AM, mood: 'happy', text: 'There. Something growing where I went grey. (He rings it, once. Tonk.) That’s for Holt. He’ll hear it. He always said I was too loud.', effects: [{ setFlag: 'ranger.aldo_garden', value: 'spared' }], next: null },
      fell: { speaker: 'narrator', mood: 'sad', text: 'At the top of the Twelve Stairs, in the crack where Aldo fell, there is one small brown mushroom nobody planted, lopsided and ordinary, dropping its spores like anybody else’s.', next: 'mark' },
      mark: {
        speaker: 'narrator', text: 'It is the only thing growing on the whole of the Stairs.',
        choices: [
          { text: '(Leave it be.)', to: null, effects: [{ setFlag: 'ranger.aldo_garden', value: 'mushroom' }] },
          { text: '(Cut a small blaze beside it: a Wayfarer walked this far.)', to: 'blaze', effects: [{ setFlag: 'ranger.aldo_garden', value: 'blazed' }] },
        ],
      },
      blaze: { speaker: 'narrator', text: 'The stone round the mushroom has gone soft and brown, and your knife goes in as if it were birch. An arrow over three notches, low down, where Aldo would have sat. Whoever comes after will know he got this far.', next: null },
      plain: { speaker: 'narrator', text: 'The crack at the top of the Stairs where Aldo sat.', next: null },
    },
  },

  // ======================= ACT III, The Salt Thief Abroad: the trail, and the squirrel’s blaze
  ...[
    'A bearer’s porridge bowl, abandoned on a crate. Somebody has salted it to the brim. The bearer sits beside it with the face of a man having a very bad morning. “It was a squirrel,” he says. “It looked me in the eye.”',
    'A sentry’s helmet by the fire, full of salt and patted neatly flat. There are small paw-prints in it, going towards the tent-poles. The sentry has decided not to mention it to anybody.',
    'A line of salt up a tent-guy, perfectly straight, as if laid with a ruler. It is not running away. It is provisioning. Somewhere at the top of this camp a squirrel is packing for a long journey.',
  ].map((text, i): DialogueDef => beat(`ranger-salt-trail-${i + 1}`, `The Salt Thief Abroad: the trail (${i + 1})`, stage(SALT, 'trail'),
    text, `ranger.salt_trail_${i + 1}`, 'A little salt, spilled at the Heart camp.')),
  {
    id: 'dialogue:obj-ranger-squirrel-blaze', name: 'The Salt Thief Abroad: a blaze on the first step', scope: 'party',
    entries: [{ when: stage(SALT, 'stair'), node: 'step' }, { node: 'plain' }],
    nodes: {
      step: {
        speaker: 'narrator', text: 'On the first step of the Twelve Stairs, a small heap of salt, patted flat, and scratched into it with tiny claws: an arrow over three notches. A blaze. It went first, and it left a mark so you could follow.',
        choices: [
          { text: '(Salute it.)', to: 'end', effects: [{ setFlag: 'ranger.squirrel_blazed', value: true }] },
          { text: '(Add a pinch of your own, for the road.)', to: 'pinch', effects: [{ setFlag: 'ranger.squirrel_blazed', value: true }] },
        ],
      },
      pinch: { speaker: 'narrator', text: 'You add your pinch to the heap. Far up the Stairs something small and fat and furious chatters at you, as if to say it had that perfectly in hand.', next: 'end' },
      end: { speaker: 'narrator', mood: 'happy', text: 'Holt would be proud. Dunmore would be furious. Both of these are good things.', next: null },
      plain: { speaker: 'narrator', text: 'A squirrel’s blaze in salt, on the first step of the Twelve Stairs.', next: null },
    },
  },
];

export default dialogues;
