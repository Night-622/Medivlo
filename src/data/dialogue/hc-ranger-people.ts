/**
 * Hollow Crown, RANGER: Thornwilds people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread and featured-bearer scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const HB = 'npc:holt-barrow' as const;

/** one object scene per numbered set piece: the quest-stage text, then a plain line afterwards */
const objs = (slug: string, q: Q, st: string, texts: string[], after: string): DialogueDef[] =>
  texts.map((text, i) => ({
    id: `dialogue:obj-${slug}-${i + 1}` as const, name: `${slug} ${i + 1}`,
    entries: [{ when: stage(q, st), node: 'now' }, { node: 'after' }],
    nodes: { now: { speaker: 'narrator', text, next: null }, after: { speaker: 'narrator', text: after, next: null } },
  }));

const dialogues: DialogueDef[] = [
  // ---------- Holt (general + mentor thread)
  {
    id: 'dialogue:ranger-holt', name: 'Holt (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HB, text: 'Hm.',
        choices: [
          offer('quest:ranger-the-old-rot', 'You said you’d show me something, one day.', 'rot', { trust: HB, value: 'friendly' }),
          offer('quest:ranger-holt-and-aldo', 'Tell me about you and Aldo.', 'aldo', { all: [{ trust: HB, value: 'trusted' }, { questCompleted: 'quest:ranger-the-rotkings-crown' }] }),
          { text: 'Tell me the joke, Holt.', to: 'joke' },
          { text: 'Where did the lookout ladder come from, Holt? It isn’t Wayfarer work.', to: 'ladder', when: { trust: HB, value: 'trusted' } },
          bye,
        ],
      },
      ladder: { speaker: HB, text: '(He looks at the ladder for a long time, as if he has not noticed it in years.) Concordia. My grandad Tobin walked the Turning road with the Wayfarers, the year I was born. Came home with a ladder.', next: 'ladder2' },
      ladder2: {
        speaker: HB, text: 'Borrowed. From the Concordant’s gardener, he said. A witch with a tongue on her. He meant to take it back at the next Turning. Then there wasn’t one.',
        choices: [
          { text: 'So it’s stolen.', to: 'ladder3' },
          { text: 'You’ve kept it all this time.', to: 'ladder4', trust: 1 },
        ],
      },
      ladder3: { speaker: HB, mood: 'happy', text: 'Borrowed. Long time borrowed. (That is very nearly a smile.) If you ever get through the gate, and you meet a witch who asks after a ladder, you never saw it.', next: null },
      ladder4: { speaker: HB, mood: 'sad', text: 'Oiled the rungs every autumn. Grandad made me promise. Said a borrowed thing is a promise you can stand on. (He pats the rail.) If you ever meet her, tell her it’s been well looked after.', next: null },
      rot: { speaker: HB, text: 'The Old Rot. Oldest log in the Thornwilds. Been rotting a thousand years and it’s still at it. Come on. It’s a walk.', next: null },
      aldo: { speaker: HB, mood: 'sad', text: 'We carved our marks on the same pine, behind the lookout, when we were eight. He cut his first. He always went first. Come and see.', next: null },
      joke: {
        speaker: HB, text: 'All right. A beetle, a boar and a Circle witch walk into the Thornwilds. And the beetle says…',
        choices: [
          { text: '(Wait patiently.)', to: 'owl', trust: 1 },
          { text: 'Says what?', to: 'owl' },
        ],
      },
      owl: { speaker: 'narrator', text: 'An owl lands on the lookout rail between you, looks at Holt, and is sick. By the time it has been dealt with, the moment has gone. Holt sighs the sigh of a man who has been here before.', next: null },
    },
  },
  {
    id: 'dialogue:obj-old-rot-log', name: 'The Old Rot', scope: 'party',
    entries: [{ when: stage('quest:ranger-the-old-rot', 'log'), node: 'log' }, { node: 'after' }],
    nodes: {
      log: { speaker: 'narrator', text: 'A fallen giant, longer than a street, soft as cake under your hand. A whole grove grows out of it: birches, ferns, a rowan, mushrooms like little shelves. Beetles are busy in it. It smells of rain and bread. Nothing on it is grey.', next: null },
      after: { speaker: 'narrator', text: 'The Old Rot, feeding its grove, as it has for a thousand years.', next: null },
    },
  },
  {
    id: 'dialogue:ranger-holt-old-rot', name: 'Mentor: the Old Rot', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: HB, text: 'Thousand years. My grandad’s grandad said it was old when he was a lad. Look what it feeds.', next: 'eats' },
      eats: {
        speaker: HB, text: 'Honest rot eats the dead. Only the dead. The done with. Then it gives it all back. The blight’s not like that. The blight eats the living. That’s the tears. Tears make rot greedy.',
        choices: [
          { text: 'Then the half-stone could make the rot honest again.', to: 'end', insight: 'ranger_old_rot', trust: 1 },
          { text: 'Why show me this?', to: 'why' },
        ],
      },
      why: { speaker: HB, text: 'So you know the difference. When it matters. (He pats the log.) There. Then the half-stone could make it honest again, maybe. Think on.', effects: [{ insight: 'ranger_old_rot' }], next: 'end' },
      end: { speaker: HB, text: 'Think on it. If they ever ask you to burn something, come here first.', next: null },
    },
  },
  {
    id: 'dialogue:obj-holt-aldo-waymark', name: 'Holt and Aldo’s first waymark', scope: 'party',
    entries: [{ when: stage('quest:ranger-holt-and-aldo', 'boys'), node: 'pine' }, { node: 'after' }],
    nodes: {
      pine: { speaker: 'narrator', text: 'Low on an old pine behind the lookout, two blazes cut by small hands fifty years ago. One is neat and careful, the other wild and deep. Under them, very small: H. A. FRIENDS. The A is cut first.', next: null },
      after: { speaker: 'narrator', text: 'Two old blazes on a pine, grown wide with the bark.', next: null },
    },
  },
  {
    id: 'dialogue:obj-aldo-last-blaze', name: 'Aldo’s last blaze', scope: 'party',
    entries: [{ when: stage('quest:ranger-holt-and-aldo', 'last'), node: 'blaze' }, { node: 'after' }],
    nodes: {
      blaze: { speaker: 'narrator', text: 'On the last green tree before the Rotting Glade: a Wayfarer blaze, cut carefully, the old way. Under it, in small neat letters: “Sorry, Holt. It’s so quiet out here.”', next: null },
      after: { speaker: 'narrator', text: 'Aldo’s last blaze, on the last green tree.', next: null },
    },
  },
  {
    id: 'dialogue:ranger-holt-aldo-blaze', name: 'Mentor: Holt and Aldo', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HB, text: 'Well?',
        choices: [{ text: '“Sorry, Holt. It’s so quiet out here.”', to: 'quiet' }],
      },
      quiet: { speaker: HB, mood: 'sad', text: '(He sits down on the lookout steps very slowly, like an old man, which he has never once looked like until now.) He was always the loud one. Always. Fifty years. And I never asked him if he wanted it quiet.', next: 'end' },
      end: { speaker: HB, text: 'Thank you. For finding it. For reading it to me. I couldn’t have read it myself.', effects: [{ trust: HB, delta: 1 }], next: null },
    },
  },
  // ---------- Wayfarer's Rest: the Salt Thief, Names on the Tree, Mushroom Supper, bounties
  {
    id: 'dialogue:ranger-dunmore', name: 'Cook Dunmore Fitch (the Salt Thief)',
    entries: [{ when: stage('quest:ranger-the-salt-thief', 'dunmore'), node: 'over' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:dunmore-fitch', text: 'Eleven years. Eleven years that red devil has had my salt. Every day. Every single day. I’ve tried traps. I’ve tried pepper. I’ve tried reasoning with it.',
        choices: [offer('quest:ranger-the-salt-thief', 'I’ll find your squirrel.', 'find'), bye],
      },
      find: { speaker: 'npc:dunmore-fitch', text: 'It hides the salt round the camp. Find the caches, find the route, find the beast. Then do as you see fit. I’ve stopped caring. I care very much.', next: null },
      over: {
        speaker: 'npc:dunmore-fitch', text: 'Well? Is it dead? Is it caught? Is it… why is your pack moving?',
        choices: [
          { text: 'It’s in my pack, Dunmore. It won’t come out.', to: 'pack', trust: 1 },
          { text: 'The feud is over. That’s all you need to know.', to: 'over2' },
          { text: 'And I found where it put eleven years of your salt.', to: 'hoard', when: { flag: 'ranger.salt_hoard' } },
        ],
      },
      hoard: { speaker: 'npc:dunmore-fitch', mood: 'happy', text: 'A whole OAK? Full? (He sits down on a pot.) Eleven years I’ve been buying salt off pedlars at robbers’ prices, and it was saving it. For winter. Like a sensible cook. (His eyes fill.) I’ve been feuding with a colleague.', next: 'pack' },
      pack: { speaker: 'npc:dunmore-fitch', mood: 'happy', text: 'In your PACK. Eleven years, and it picks you. (He laughs until he has to sit down.) Take it. Take it with my blessing. Take some stew. Don’t let it near the stew.', next: null },
      over2: { speaker: 'npc:dunmore-fitch', text: 'Over. After eleven years. I don’t know what to do with my mornings. (He looks lost for a moment.) Have some stew.', next: null },
    },
  },
  ...objs('salt-cache', 'quest:ranger-the-salt-thief', 'caches', [
    'A knot-hole in the cook-tent’s pole, packed tight with salt, and one acorn, for variety.',
    'Under a loose stone by the water butt: a pile of salt and a single silver spoon that the camp has been blaming on Marjory Burrell for six years.',
    'In the boot of a sleeping Wayfarer. You decide not to wake him. The trail of spilled salt leads up an old pine at the edge of camp.',
  ], 'An empty cache, licked clean.'),
  {
    id: 'dialogue:obj-salt-squirrel', name: 'The salt thief', scope: 'party',
    entries: [{ when: stage('quest:ranger-the-salt-thief', 'squirrel'), node: 'thief' }, { node: 'after' }],
    nodes: {
      thief: {
        speaker: 'narrator', text: 'On a branch of the old pine sits the fattest red squirrel you have ever seen, with salt on its whiskers and eleven years of victory in its eyes. It looks at you. You look at it.',
        choices: [
          { text: '(Grab it.)', to: 'caught', effects: [{ setFlag: 'ranger.squirrel', value: 'caught' }] },
          { text: '(Hold out a pinch of salt, palm open.)', to: 'peace', effects: [{ setFlag: 'ranger.squirrel', value: 'peace' }] },
        ],
      },
      caught: { speaker: 'narrator', text: 'You lunge. It is not there. It is on your shoulder. Then it is in your pack, among your socks, and it makes it extremely clear that it intends to stay. The matter appears to be closed.', next: null },
      peace: { speaker: 'narrator', text: 'It looks at the salt. It looks at you. It eats the salt, climbs down your arm, gets into your pack among your socks, and goes to sleep. The matter appears to be closed.', next: null },
      after: { speaker: 'narrator', text: 'The squirrel’s old pine, empty now. Your pack is warm.', next: null },
    },
  },
  {
    id: 'dialogue:ranger-davy', name: 'Davy Fernsby (Names on the Tree)',
    entries: [{ when: stage('quest:ranger-names-on-the-tree', 'davy'), node: 'sit' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:davy-fernsby', text: 'Three names on the tree this year. One of them’s my sister’s. Kit. She went out in the spring and the path moved and she didn’t come back. They want to carve her without her bow. You can’t carve a Wayfarer without her bow.',
        choices: [offer('quest:ranger-names-on-the-tree', 'I’ll find her bow.', 'find'), bye],
      },
      find: { speaker: 'npc:davy-fernsby', text: 'Ash-wood, with a fox burned on the grip. She did that herself, when she was twelve. It’s out in the Thornwilds somewhere. Paths don’t keep things. They just move them about.', next: null },
      sit: {
        speaker: 'npc:davy-fernsby', mood: 'sad', text: '(He is sitting under the memorial tree, looking up at his sister’s name and her bow beneath it.) She’d have hated the fuss. She’d have liked the bow, though.',
        choices: [
          { text: '(Sit with him.)', to: 'end', trust: 1 },
          { text: 'Tell me about her.', to: 'kit' },
          { text: 'Davy, she wasn’t lost. She found the blight first, and blazed a way round it.', to: 'way', when: { flag: 'ranger.kits_way' } },
        ],
      },
      way: { speaker: 'npc:davy-fernsby', mood: 'sad', text: '(He stares at you.) In the spring? Before anyone? (He laughs, and it breaks in the middle.) Course she did. Terrible at waiting. Holt says the camp’s calling that path Kit’s Way now. She’d have hated that too. She’d have loved it.', next: 'end' },
      kit: { speaker: 'npc:davy-fernsby', text: 'Loud. Fast. Terrible at waiting. Best shot in the camp, and she knew it. She’d have gone to the gate with you, you know. She’d have been insufferable about it.', next: 'end' },
      end: { speaker: 'npc:davy-fernsby', text: 'Thanks. For bringing her home. Most of her.', next: null },
    },
  },
  {
    id: 'dialogue:obj-kit-fernsby-bow', name: 'Kit Fernsby’s bow', scope: 'party',
    entries: [{ when: stage('quest:ranger-names-on-the-tree', 'bow'), node: 'bow' }, { node: 'after' }],
    nodes: {
      bow: { speaker: 'narrator', text: 'In a hollow under a holly, where the path must have left it: an ash-wood bow, unstrung, silvered with dew. A small fox is burned into the grip, in a child’s careful lines. There is no one else here. Only the bow.', next: null },
      after: { speaker: 'narrator', text: 'A hollow under a holly.', next: null },
    },
  },
  {
    id: 'dialogue:obj-memorial-carving', name: 'The memorial tree', scope: 'party',
    entries: [{ when: stage('quest:ranger-names-on-the-tree', 'carve'), node: 'carve' }, { node: 'after' }],
    nodes: {
      carve: { speaker: 'narrator', text: 'The memorial tree is an old oak at the heart of the camp, its bark carved with Wayfarer names going back two hundred years. KIT FERNSBY is new and pale at the bottom. You hang her bow beneath it on a peg, and it sways once and is still.', next: null },
      after: { speaker: 'narrator', text: 'The Wayfarers’ memorial tree. Kit Fernsby’s bow hangs under her name.', next: null },
    },
  },
  {
    id: 'dialogue:ranger-morel', name: 'Sister Morel (Mushroom Supper)',
    entries: [{ when: stage('quest:ranger-mushroom-supper', 'morel'), node: 'look' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:sister-morel', text: 'Aldo’s mushrooms. The whole camp’s mad for them. I’ve never tasted better, and I’ve eaten everything that grows in the Thornwilds, including some things I shouldn’t. I want more, to study. From his old supper spot.',
        choices: [offer('quest:ranger-mushroom-supper', 'I’ll bring you some.', 'bring'), bye],
      },
      bring: { speaker: 'npc:sister-morel', text: 'A ring of stones in the Rotwood. He used to cook there. Three will do. Don’t eat them on the way. I know you will. Don’t.', next: null },
      look: { speaker: 'narrator', text: 'Sister Morel lays the three mushrooms gill-down on a black slate, the way you do to take a spore print. She waits. She lifts them. The slate is clean.', next: 'none' },
      none: {
        speaker: 'npc:sister-morel', mood: 'afraid', text: 'Nothing. Not a spore. Every mushroom that ever grew drops spores, it’s what they’re for. These are perfect, and they’re barren. They can’t make more of themselves. They only eat.',
        choices: [{ text: 'Then whatever Aldo’s rot is, it can’t make anything.', to: 'end', effects: [{ setFlag: 'ranger.mushrooms_barren', value: true }] }],
      },
      end: { speaker: 'npc:sister-morel', text: 'I’m going to stop serving them. Quietly. Don’t tell Aldo. Take these herbs. They’re honest.', next: 'test' },
      test: { speaker: 'npc:sister-morel', text: 'One more thing, while I’m frightened. Honest rot eats anything that’s finished living. Take one of these out to Holt’s Old Rot and lay it down. If the oldest rot in the Thornwilds won’t touch it, I want to know.', next: null },
    },
  },
  ...objs('aldo-supper-mushroom', 'quest:ranger-mushroom-supper', 'mushrooms', [
    'A ring of blackened stones in the grey Rotwood, and round it the mushrooms: pale, plump, each one exactly like the next. You pick one. It comes away with no root at all.',
    'Another, growing out of a dead branch that is not rotting. The mushroom is warm, like something that has just been eating.',
    'The last, the biggest, from the middle of the ring. Under it the leaf-mould is not mould at all. It is grey dust.',
  ], 'A ring of stones, picked clean.'),
  {
    id: 'dialogue:ranger-marjory', name: 'Marjory Burrell (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:marjory-burrell', text: 'Bounty-stake. Two on it this week. And before you ask, no, I didn’t take the silver spoon. Six years I’ve been asked about that spoon.',
        choices: [
          offer('quest:ranger-bounty-arrow-thieves', 'The arrow-thieves.', 'arrows'),
          offer('quest:ranger-bounty-old-snapjaw', 'Old Snapjaw.', 'snap'),
          { text: 'I found the spoon. The squirrel had it.', to: 'spoon', when: { questCompleted: 'quest:ranger-the-salt-thief' }, trust: 1 },
          bye,
        ],
      },
      arrows: { speaker: 'npc:marjory-burrell', text: 'Briarlings, picking quivers on the trail like pockets. Six of them. They use the arrows as toothpicks, which is insulting as well as expensive.', next: null },
      snap: { speaker: 'npc:marjory-burrell', text: 'A Bloomtrap the size of a cottage, sitting on the Bloomfen ferry crossing pretending to be a lily pad. It swallowed the punt. The ferryman would like it back. The punt, I mean.', next: null },
      spoon: { speaker: 'npc:marjory-burrell', mood: 'happy', text: 'THE SQUIRREL. Six years! (She stands on the bounty-stake and shouts it to the whole camp.) THE SQUIRREL HAD IT!', next: null },
    },
  },
  // ---------- the Thornwilds: the Path That Likes Him, the Still Tune
  {
    id: 'dialogue:ranger-cobb', name: 'Cobb Tinsley (the Path That Likes Him)',
    entries: [{ when: stage('quest:ranger-the-path-that-likes-him', 'cobb'), node: 'fond' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:cobb-tinsley', text: 'Pins, ribbons, needles, a very good teapot. Four days I’ve been walking to Wayfarer’s Rest. Four days. I keep coming back to this exact tree. I’ve named the tree. It’s called Gerald.',
        choices: [offer('quest:ranger-the-path-that-likes-him', 'Let me walk your circle.', 'walk'), bye],
      },
      walk: { speaker: 'npc:cobb-tinsley', text: 'Would you? I’ll stay here with Gerald. We’ve grown close.', next: null },
      fond: {
        speaker: 'npc:cobb-tinsley', text: 'Well? Is it a curse? Is it the tears? Is it Gerald?',
        choices: [
          { text: 'The path likes you, Cobb. It doesn’t want you to leave.', to: 'likes' },
          { text: '(Ask the path, kindly, to let him go.)', to: 'ask', school: 'verdant' },
        ],
      },
      likes: { speaker: 'npc:cobb-tinsley', mood: 'happy', text: 'It LIKES me? (He goes pink.) Well. Nobody’s liked me since my mother. I’ll come back this way, then. Every spring. Tell it I’ll come back.', next: 'go' },
      ask: { speaker: 'narrator', text: 'You crouch and lay your palm on the trail and tell it, quietly, that Cobb will come back in the spring. The path thinks about it. Then, a little sulkily, it straightens out.', next: 'go' },
      go: { speaker: 'npc:cobb-tinsley', text: 'Here. For your trouble. Now, will you walk me in to Wayfarer’s Rest? Four days I’ve meant to sell pins there. I’d like company, in case the path changes its mind. And give Gerald a pat on the way past.', next: null },
    },
  },
  ...objs('fond-path', 'quest:ranger-the-path-that-likes-him', 'path', [
    'Here the path bends left, though there is nothing to bend round. Cobb’s bootprints go straight on, and the path has curled after them like a cat after a string.',
    'A fork where there was no fork yesterday. One branch is overgrown. The other has been trodden flat by four days of Cobb, and is visibly pleased about it.',
    'The path loops back round Gerald, and here, under a bramble, someone has dropped a ribbon. The path has grown a little loop round it, to keep it.',
  ], 'An ordinary stretch of path. Probably.'),
  {
    id: 'dialogue:ranger-ivo', name: 'Old Ivo Pennick (the Still Tune)',
    entries: [{ when: stage('quest:ranger-the-still-tune', 'ivo'), node: 'play' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ivo-pennick', text: 'Fifty years I played the Still Tune. One song, and every path in the Thornwilds held still while it lasted. Then one morning I woke and it was gone out of my head, clean as a wiped slate.',
        choices: [offer('quest:ranger-the-still-tune', 'Somebody must remember it.', 'remember'), bye],
      },
      remember: { speaker: 'npc:ivo-pennick', text: 'The Bloomkin might. They grew up hearing it. Some of the old briars used to hum along. Go and listen in the bramble. If anything’s humming, it’ll be that.', next: null },
      play: {
        speaker: 'npc:ivo-pennick', text: 'Hum it. Go on. All three bits.',
        choices: [{ text: '(Hum the three phrases.)', to: 'tune' }],
      },
      tune: { speaker: 'narrator', text: 'Ivo’s fingers move before he does. The fiddle comes up to his chin, and the tune comes out of it whole, slow and stepping. All round you the bramble stops rustling. The path under your boots goes still. For one song, nothing in the Thornwilds moves.', next: 'end' },
      end: { speaker: 'npc:ivo-pennick', mood: 'happy', text: 'There she is. There she is. (He is crying, and playing it again.) I’ll teach it to the young ones this time. I’ll write it down. I never wrote it down.', next: 'ford' },
      ford: { speaker: 'npc:ivo-pennick', text: 'But first she wants playing where she was made for. The Wandering Ford, where the carts cross to the fen. Thirty years the carts have gone round by the long way because that ford won’t hold still. You play it. My hands are for teaching, now.', next: null },
    },
  },
  ...objs('humming-briar', 'quest:ranger-the-still-tune', 'hum', [
    'A thicket of old briar, humming to itself in the shade. Three slow notes, going down, like someone settling into a chair.',
    'A bramble with tiny Bloomkin buds asleep on it, all humming the same phrase in their sleep: a step up, a step back, and a long held note.',
    'The oldest briar in the wood, thick as your leg, humming the last phrase so low you feel it in your boots. Then, almost shyly, it hums all three together.',
  ], 'A bramble, quiet now.'),
  // ---------- the Bloomfen: Lilies for a Wedding, the Bloomkin Census
  {
    id: 'dialogue:ranger-dilys', name: 'Dilys Marram (Lilies for a Wedding)',
    entries: [{ when: stage('quest:ranger-lilies-for-a-wedding', 'dilys'), node: 'wed' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:dilys-marram', text: 'I am getting married at noon. I need real lilies. Half the lilies in this fen eat people. My best man has already been eaten once this morning, and I need him for the speech.',
        choices: [offer('quest:ranger-lilies-for-a-wedding', 'I’ll pick you real ones.', 'pick'), bye],
      },
      pick: { speaker: 'npc:dilys-marram', text: 'Real ones nod with the wind. Bloomtraps nod against it. Ezra didn’t know that. Ezra knows it now.', next: null },
      wed: {
        speaker: 'npc:dilys-marram', mood: 'happy', text: 'Four lilies! Real ones! And Ezra’s been spat out and only smells a bit. Stay for the wedding? There’s pie.',
        choices: [{ text: 'I’d love to.', to: 'stay', trust: 1 }, { text: 'Congratulations. I should go.', to: 'go' }],
      },
      stay: { speaker: 'narrator', text: 'Ezra Sedge’s speech is mostly about the inside of a Bloomtrap. It is the best wedding speech anyone in the Bloomfen has ever heard. There is pie.', next: null },
      go: { speaker: 'npc:dilys-marram', text: 'Take pie, then. Two. Ezra won’t want his. Ezra has gone off lilies.', next: null },
    },
  },
  {
    id: 'dialogue:obj-fen-lily-1', name: 'A lily', entries: [{ when: stage('quest:ranger-lilies-for-a-wedding', 'lilies'), node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'A white fen lily, nodding with the wind. Real. You pick it gently, and it smells of summer.', next: null },
      after: { speaker: 'narrator', text: 'A lily, picked.', next: null },
    },
  },
  {
    id: 'dialogue:obj-fen-lily-2', name: 'A lily, and a best man', scope: 'party',
    entries: [{ when: stage('quest:ranger-lilies-for-a-wedding', 'lilies'), node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'This lily is nodding against the wind, and from inside it comes a muffled voice: “Is that the bride? Tell her I’m fine. Tell her I’ve almost finished the speech.” You prise the Bloomtrap open. Ezra Sedge falls out, sticky, and still holding the ring. The real lily beside it, you pick.', next: null },
      after: { speaker: 'narrator', text: 'A sulking Bloomtrap, and a picked lily.', next: null },
    },
  },
  {
    id: 'dialogue:obj-fen-lily-3', name: 'A lily', entries: [{ when: stage('quest:ranger-lilies-for-a-wedding', 'lilies'), node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'A pale yellow lily at the water’s edge, nodding the right way. A frog is sitting on it. The frog agrees to move, eventually.', next: null },
      after: { speaker: 'narrator', text: 'A lily, picked, and a disgruntled frog.', next: null },
    },
  },
  {
    id: 'dialogue:obj-fen-lily-4', name: 'A lily', entries: [{ when: stage('quest:ranger-lilies-for-a-wedding', 'lilies'), node: 'now' }, { node: 'after' }],
    nodes: {
      now: { speaker: 'narrator', text: 'The last lily, the finest, nodding with the wind like a polite guest. The one next to it nods against the wind and snaps at your sleeve. You keep your sleeve, and the lily.', next: null },
      after: { speaker: 'narrator', text: 'A lily, picked.', next: null },
    },
  },
  {
    id: 'dialogue:ranger-cattail', name: 'Old Cattail (the Bloomkin Census)',
    entries: [{ when: stage('quest:ranger-the-bloomkin-census', 'cattail'), node: 'number' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:old-cattail', text: '(A bulrush as tall as a man, bending slowly in no wind at all.) One… hundred… and… Oh. Now I have lost count again. Wayfarer. We are counting ourselves. Before we choose a side, we would like to know how many of us there are to choose.',
        choices: [offer('quest:ranger-the-bloomkin-census', 'I’ll count for you.', 'count'), bye],
      },
      count: { speaker: 'npc:old-cattail', text: 'Thank you. Four clumps of us, round the fen. Count them quickly. They wander.', next: null },
      number: {
        speaker: 'npc:old-cattail', text: 'Well? How many are we?',
        choices: [{ text: 'Four hundred and twelve.', to: 'many', trust: 1 }, { text: 'Lots. Hundreds.', to: 'many' }],
      },
      many: { speaker: 'npc:old-cattail', mood: 'happy', text: 'Four hundred and twelve. (It bends almost to the water, very slowly, with joy.) Then we are a people. A people has a say. When the time comes to choose, we will want to say it.', next: 'mint' },
      mint: { speaker: 'npc:old-cattail', text: 'Only… did you count Old Pennyroyal as seventy-seven? (It sways, troubled.) It always says that. Seventy-seven years. But none of us is older than the growth, and the growth is thirty. Would you ask it? It will not tell me. It says I am too young.', next: null },
    },
  },
  ...objs('census-bloomkin', 'quest:ranger-the-bloomkin-census', 'count', [
    'A clump of lily-Bloomkin floating in the shallows like a raft of plates. You count a hundred and six. They count you back: one.',
    'A clump of moss-Bloomkin on a drowned log, all trying to be counted first. You count ninety-eight, twice, to be fair.',
    'A clump of reed-Bloomkin who move every time you get to forty. You count a hundred and thirty-one, eventually, by singing to them until they hold still.',
    'One very old water-mint Bloomkin, alone on a stone, who would like it noted that it counts as seventy-seven, because it has been here seventy-seven years. You note it.',
  ], 'A clump of Bloomkin, counted and very pleased about it.'),
  // ---------- the Rotwood: the House Is Just Old
  {
    id: 'dialogue:ranger-bram', name: 'Bram Hatchley (the House Is Just Old)',
    entries: [{ when: stage('quest:ranger-the-house-is-just-old', 'bram'), node: 'go' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:bram-hatchley', text: 'Rotten? It’s not rotten. It’s getting old. Same as me. The roof’s going soft and so are my knees, and nobody’s asking me to leave my knees.',
        choices: [offer('quest:ranger-the-house-is-just-old', 'The blight will take it, Bram. Will you come if you can bring one thing?', 'one'), bye],
      },
      one: { speaker: 'npc:bram-hatchley', text: 'One thing. (He looks round his house for a long time.) Help me choose. I can’t. Every time I pick something up I want to put it down again.', next: null },
      go: {
        speaker: 'npc:bram-hatchley', text: 'There. Got it. (He looks back at the cottage, at the soft grey roof, the door hanging.) You know the difference, don’t you. You’re a Wayfarer.',
        choices: [
          { text: 'The difference between what?', to: 'diff' },
          { text: '(Wait for him.)', to: 'diff' },
        ],
      },
      diff: {
        speaker: 'npc:bram-hatchley', text: 'Between old and wrong. This house is just old. It’d go back to the wood honest, give it fifty years, and feed a dozen trees. That out there, the grey: that’s wrong. That’s rot that’s forgotten it’s meant to give something back.',
        choices: [
          { text: 'Honest rot only eats what’s done with.', to: 'end', insight: 'ranger_old_rot', trust: 1 },
          { text: 'Come on, Bram. Let’s walk.', to: 'end' },
        ],
      },
      end: { speaker: 'npc:bram-hatchley', text: 'Aye. That’s it. That’s it exactly. Walk me out, then. Slowly. The knees.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hatchley-keepsake', name: 'Bram’s one thing', scope: 'party',
    entries: [{ when: stage('quest:ranger-the-house-is-just-old', 'keepsake'), node: 'choose' }, { node: 'after' }],
    nodes: {
      choose: {
        speaker: 'narrator', text: 'Bram’s cottage: soft-roofed, crooked, full of fifty years. His first axe, worn to a sliver. A cracked blue jug. A little wooden horse, carved badly, for a child who has grown up and gone.',
        choices: [
          { text: '(Hand him the axe.)', to: 'axe', effects: [{ setFlag: 'ranger.bram_keepsake', value: 'axe' }] },
          { text: '(Hand him the blue jug.)', to: 'jug', effects: [{ setFlag: 'ranger.bram_keepsake', value: 'jug' }] },
          { text: '(Hand him the wooden horse.)', to: 'horse', effects: [{ setFlag: 'ranger.bram_keepsake', value: 'horse' }] },
        ],
      },
      axe: { speaker: 'narrator', text: 'He weighs it in his hand, the sliver of an axe that built the house. “Aye,” he says. “It’ll want to see a new tree come down.”', next: null },
      jug: { speaker: 'narrator', text: 'He turns the blue jug in his hands. “My wife’s,” he says. “She’d have had the roof off the moment it went soft. She’d have been right.”', next: null },
      horse: { speaker: 'narrator', text: 'He holds the little horse a long while. “I made this for our Peg,” he says. “It’s terrible. She loved it.” He puts it in his coat, over his heart.', next: null },
      after: { speaker: 'narrator', text: 'Bram’s cottage, empty, going softly back to the wood.', next: null },
    },
  },

  {
    id: 'dialogue:ranger-vetch', name: 'Envoy Primula Vetch (general)',
    entries: [{ when: { flag: 'ranger.line', value: 'burn' }, node: 'burnt' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'npc:primula-vetch', text: 'I have written to the Circle eleven times since I arrived. Mostly about the mud. Partly about you.', next: null },
      burnt: { speaker: 'npc:primula-vetch', mood: 'sad', text: 'The city is safe, and the Circle is grateful, and I have not slept. I keep hearing the reeds. Is that usual?', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:ranger-fernhat', name: 'Fernhat, the Bloomkin scout',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:bloomkin-scout', mood: 'happy', text: 'The grey goes deep, Wayfarer, but the paths here are slow and kind. Not like home. I like them. I may stay.', next: null } },
  },
  {
    id: 'dialogue:ranger-teasel', name: 'C-1 the Hedge House: Teasel Gammon', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:teasel-gammon', text: 'A Wayfarer! A real one, with mud on! The Hedge House was yours, you know. Your lot slept upstairs and the witches slept down. Nobody’s used the upstairs in thirty years. It’s full of bats. Polite bats.',
        choices: [
          { text: 'I need to find the Verdant Sentinel.', to: 'willow', quest: true },
          { text: 'Holt Barrow sent me. Well. He didn’t stop me.', to: 'holt' },
        ],
      },
      holt: { speaker: 'npc:teasel-gammon', mood: 'happy', text: 'A Barrow! There was a Barrow came through every Turning, regular as rain. Nan Briar knew the last one. Holt’s grandad, I should think. She says he owes her a ladder.', next: 'willow' },
      willow: { speaker: 'npc:teasel-gammon', text: 'The Weeping Willow. Stag’s Rest, in the Gloamwood, along the old Wayfarer ways, if you can still read them. Ask Nan Briar first. And take her something for the kettle. She bites.', next: null },
    },
  },
  {
    id: 'dialogue:hook-ranger-nanbriar', name: 'Hook: Nan Briar for the Ranger', scope: 'party',
    entries: [
      { when: { all: [stage('quest:ranger-the-hedge-house', 'nan'), { not: { questActive: 'quest:cc-tears' } }] }, node: 'start' },
      { when: { all: [stage('quest:ranger-the-weeping-willow', 'tell'), { not: { questActive: 'quest:cc-tears' } }] }, node: 'willow' },
    ],
    nodes: {
      start: {
        speaker: 'npc:nanbriar', text: 'Wayfarer, by the boots. And a Barrow look about you. Not the face. The way you stand, like a gate somebody’s leaning on. Who taught you?',
        choices: [
          { text: 'Holt Barrow.', to: 'holt' },
          { text: 'Teasel says a Barrow owes you a ladder.', to: 'ladder' },
          { text: '(Tell her what Tobin wrote on the loft beam.)', to: 'note', when: { flag: 'ranger.tobin_note' } },
        ],
      },
      note: { speaker: 'npc:nanbriar', text: '“She won’t.” (She makes you say it twice.) He was right, the dog. He knew me better than my own cat does. (Her mouth twitches, once.) He still owes me a ladder.', next: 'line' },
      holt: { speaker: 'npc:nanbriar', text: 'Holt. That’ll be Tobin Barrow’s grandson. Tobin borrowed my long ladder at the Turning of nine-eighty-eight to fetch a cat out of the Willow, and I have not seen it since.', next: 'ladder' },
      ladder: { speaker: 'npc:nanbriar', mood: 'angry', text: 'Fifty-four years. The cat came down on its own, by the way. The ladder never did. You tell Holt Barrow that his family owes me a ladder, and interest.', next: 'line' },
      line: {
        speaker: 'npc:nanbriar', text: 'Now. The rot. Your lot keep the paths and the rot honest, or they used to. What did you do about your blight, back home?',
        choices: [
          { text: 'We burned a firebreak through the Bloomfen.', to: 'burn', when: { flag: 'ranger.line', value: 'burn' }, effects: [{ trust: 'npc:nanbriar', set: 2 }] },
          { text: 'We held the line, tree by tree.', to: 'hold', when: { flag: 'ranger.line', value: 'hold' } },
          { text: 'I made the rot honest again.', to: 'honest', when: { flag: 'ranger.line', value: 'honest' } },
        ],
      },
      burn: { speaker: 'npc:nanbriar', text: 'Burned it. Well. Someone had to. Nobody ever thanks the one with the torch. I won’t either, but I won’t spit. Go on to the Willow.', next: null },
      hold: { speaker: 'npc:nanbriar', text: 'Tree by tree. That’s Wayfarer stubborn, that is. Your Bloomkin will owe you. Go on to the Willow, and see if you can be stubborn at it.', next: null },
      honest: { speaker: 'npc:nanbriar', mood: 'happy', text: '(She sets her cup down very carefully.) Honest. With the stone. Nobody’s done that since the crown broke. The Willow’s glade has gone the wrong kind of rotten, child. Go and show it the right kind.', next: null },
      // C-3: telling Nan the Willow’s leaves have fallen
      willow: { speaker: 'npc:nanbriar', text: '(She is out in her garden with Parson the cat, staring at the Gloamwood.) It’s let go. I felt it in my knees an hour ago, like weather. Did the leaves rot, Wayfarer? Tell me they rotted.', next: 'told' },
      told: {
        speaker: 'narrator', text: 'You tell her: the weeping, the fight in the roots, and the leaves at the end, all falling at once and going brown and soft in the grass before they had finished landing.',
        choices: [
          { text: 'They rotted. Honestly. Beetles and all.', to: 'rotted' },
          { text: 'I made the rot honest, with the half. Like at home.', to: 'mended', school: 'verdant', when: { flag: 'ranger.line', value: 'honest' }, trust: 1, trustNpc: 'npc:nanbriar' },
          { text: 'It looked relieved.', to: 'relieved' },
        ],
      },
      rotted: { speaker: 'npc:nanbriar', text: '(She lets out a breath she seems to have been holding for some years.) Good. Then the wood isn’t dead, only stuck. Stuck I can work with.', next: 'stag' },
      mended: { speaker: 'npc:nanbriar', text: 'With the half. Of course with the half. (She sits down on her step, quite suddenly.) Tobin Barrow’s grandson’s pupil, mending my Willow. I’ll have to forgive the ladder. I won’t. But I’ll have to.', next: 'stag' },
      relieved: { speaker: 'npc:nanbriar', text: 'Trees do. You would too, if you’d been holding your breath since the crown broke.', next: 'stag' },
      stag: { speaker: 'npc:nanbriar', text: 'Now listen. The Stag in the deep glade isn’t sick, whatever they say at the Lodge. It’s grieving. It walked in front of every Turning procession for a thousand years, and thirty years ago the procession stopped coming.', next: 'teasel' },
      teasel: {
        speaker: 'npc:nanbriar', text: 'There’s one soul this side of the arch who walked behind that Stag in the last procession: Teasel Gammon, carrying the Verdant pot, with his hat on crooked. I’ll send him out after you.',
        choices: [
          { text: 'Why would the Stag care about Teasel?', to: 'care', quest: true },
          { text: 'I’ll look after him.', to: 'after', quest: true },
        ],
      },
      care: { speaker: 'npc:nanbriar', text: 'Because he’s what’s left of it. Grief wants somebody to look at, child. Even a Gammon. Go on. Follow your rotten mushrooms. He’ll catch you up.', next: null },
      after: { speaker: 'npc:nanbriar', text: 'You will. And don’t let him carry anything heavy. He’ll try. Gammons always try.', next: null },
    },
  },
  ...objs('ranger-old-blaze', 'quest:ranger-stags-rest', 'ways', [
    'On a Gloamwood oak, grown nearly over: a Wayfarer blaze, an arrow over three notches, cut a hundred years ago by somebody walking the Turning road. Your hand fits it exactly.',
    'A second blaze, on a stone this time, half under moss. Beside it someone has scratched, very small: “T. B. was here, and lost the ladder.”',
    'The third blaze points at a hill with a great weeping willow on top. Around the hill the trees are grey and soft and falling, but nothing is growing out of them. No mushrooms. No beetles. Nothing is eating. It is rot that feeds nobody.',
  ], 'An old Wayfarer blaze, freshly cleared of moss.'),
  {
    id: 'dialogue:ranger-rotkings-trail', name: 'C-4 into the Gloamwood after Aldo', scope: 'party',
    entries: [{ when: { flag: 'ranger.line', value: 'hold' }, node: 'scout' }, { node: 'trail' }],
    nodes: {
      trail: { speaker: 'narrator', text: 'Grey spores drift in the Gloamwood light, falling like snow that never lands. Where they settle, the wood goes soft and grey. You know whose they are. You grew up eating supper in his garden.', next: null },
      scout: { speaker: 'npc:bloomkin-scout', text: '(A small Bloomkin with a fern for a hat pops up out of the bracken.) Wayfarer! You held the line for us. We came through the gate behind you, very quietly. I know these woods now. I will show you where the grey goes.', next: 'trail' },
    },
  },
  ...objs('ranger-barren-spore', 'quest:ranger-the-rotkings-trail', 'spores', [
    'A drift of grey spores on a fallen Gloamwood birch. The birch is not rotting. It is just going grey, from the outside in, as if something were drinking the colour out of it.',
    'Grey spores in a wolf’s track, and the wolf’s track goes the same way: deeper in, towards the glade. The wolves are running from it.',
    'A neat row of grey fungus, planted a hand apart, the way a man plants leeks. Then another row. Then another. They lead to the edge of a glade full of weeping trees.',
  ], 'Grey spores, trodden into honest mud.'),
  {
    id: 'dialogue:obj-ranger-stag-glade-edge', name: 'C-4 the edge of the Stag’s glade', scope: 'party',
    entries: [{ when: stage('quest:ranger-the-rotkings-trail', 'glade'), node: 'glade' }, { node: 'after' }],
    nodes: {
      glade: { speaker: 'narrator', text: 'Through the trees, a white shape stands in the middle of a glade, head down, weeping black into the grass. All round it, in the grey, someone has planted neat rows of barren fungus, and they are drinking the Stag’s tears as fast as it can weep them.', next: 'aldo' },
      aldo: { speaker: 'npc:aldo-mire', mood: 'happy', text: '(A voice from somewhere under the roots, cheerful and muffled.) Isn’t it beautiful, pup? It’s been grieving thirty years. There’s enough grief in that Stag to rot the whole wood. Then we’ll see what grows!', next: null },
      after: { speaker: 'narrator', text: 'The edge of the Stag’s glade.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:ranger-featured-falconer', name: 'Featured: The Hooded Stag', scope: 'party',
    entries: [
      { when: stage('quest:ranger-the-hooded-stag', 'back'), node: 'back' },
      { when: { all: [stage('quest:ranger-the-hooded-stag', 'run'), { not: { flag: 'ranger.perrin_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-falconer', text: 'You hood a hawk to calm it. No sight, no fright. I mean to hood the White Stag’s grief the same way, so it can’t run and can’t weep. Old Wren would. You’re a Ranger. You’ll know its running-path.',
        choices: [
          { text: 'I’ll show you its path. But I think it should be let run until it’s run out.', to: 'run', quest: true, effects: [{ setFlag: 'ranger.perrin_asked', value: true }] },
          { text: 'I’ll track it for you.', to: null, quest: true, effects: [{ setFlag: 'ranger.perrin_asked', value: true }] },
        ],
      },
      run: { speaker: 'npc:bearer-falconer', text: 'Run out? Grief doesn’t run out. It just runs. (He hefts the hood.) Show me the path, and we’ll argue on the way.', next: null },
      back: {
        speaker: 'npc:bearer-falconer', text: 'A circle. Round and round the place where the procession used to walk past it. It isn’t running from anything. It’s waiting for someone. I’m not hooding that. You were right, and I’m annoyed. When we go to the Heart I’ll be on your bow side.',
        effects: [{ setFlag: 'ranger.perrin_thanked', value: true }], next: null,
      },
    },
  },
  ...objs('ranger-stag-run', 'quest:ranger-the-hooded-stag', 'run', [
    'Hoofprints, deep and white-edged, worn into the Gloamwood floor like a road. They do not wander. They go round.',
    'The running-path crosses an old paved way, mossed over: the Turning road, where the crown’s procession passed every twelve years. Here the hoofprints stop, and stand, and wait, and then go on.',
    'Round again, to the same paving stone. The Stag has stood here so many times the stone is worn into the shape of four hooves. A hooded hawk would never have learned the way.',
  ], 'The Stag’s worn running-path.'),
  {
    id: 'dialogue:ranger-featured-skald', name: 'Featured: The Stag’s Last Saga', scope: 'party',
    entries: [
      { when: stage('quest:ranger-the-stags-last-saga', 'back'), node: 'back' },
      { when: { all: [stage('quest:ranger-the-stags-last-saga', 'verses'), { not: { flag: 'ranger.sigrid_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-skald', text: 'The Saga of the White Stag. Ragna taught it me, all forty verses. Every morning since I came through, I’ve woken with one fewer. They’re going somewhere. Where the Stag has been, I think. You’re a tracker. Track my verses.',
        choices: [{ text: 'Verses leave tracks?', to: 'tracks', quest: true, effects: [{ setFlag: 'ranger.sigrid_asked', value: true }] }],
      },
      tracks: { speaker: 'npc:bearer-skald', text: 'In the Fells, everything leaves tracks. A song most of all. Go on, Ranger. I’ll be drumming so I don’t forget the rest.', next: null },
      back: {
        speaker: 'npc:bearer-skald', mood: 'happy', text: 'Three verses back! On a stone, in a stream, in a fox’s mouth, you say? That’s the Gloamwood for you. It was keeping them for the Stag. I’ll give them back to it, when it’s done grieving. I’ll drum for you at the Heart.',
        effects: [{ setFlag: 'ranger.sigrid_thanked', value: true }], next: null,
      },
    },
  },
  ...objs('ranger-saga-verse', 'quest:ranger-the-stags-last-saga', 'verses', [
    'On a flat stone where the Stag drinks, words have grown into the lichen: “White it walked before the crown, and the crown walked after.” A verse, kept by the stone.',
    'In a stream, the water runs over the pebbles in a pattern you can almost read, and then can: “Twelve the roads and one the Stag, that knew them all.”',
    'A fox crosses the path with something in its mouth: a strip of birch bark, and on it, scratched as if by an antler: “When the crown comes not, it waits, it waits.” The fox lets you have it, in exchange for a look of respect.',
  ], 'A verse, found and taken home.'),
  // ---------- C-6 Holt's Blaze
  {
    id: 'dialogue:obj-ranger-holt-blaze', name: 'C-6 Holt’s blaze', scope: 'party',
    entries: [{ when: stage('quest:ranger-holts-blaze', 'blaze'), node: 'blaze' }, { node: 'after' }],
    nodes: {
      blaze: { speaker: 'narrator', text: 'On the Concordia side of the Verdant arch, cut into the stone at shoulder height: a Wayfarer blaze, still white where the knife went in. An arrow over three notches, and below it the old sign for “I walked this far.”', next: 'meaning' },
      meaning: {
        speaker: 'narrator', text: 'Holt does not write. He has never written anyone a letter in his life. But he walked all the way to the gate, alone, and through it, and cut this, and went home.',
        choices: [
          { text: '(Put your hand flat on the blaze.)', to: 'answer', quest: true, effects: [{ setFlag: 'ranger.holt_blaze', value: true }] },
          { text: '(Look closer at the stone below it.)', to: 'joke', when: { flag: 'ranger.holt_devotable' } },
        ],
      },
      joke: { speaker: 'narrator', text: 'Scratched very small under the blaze, as if he were embarrassed: “A beetle, a boar and a Circle witch.” Nothing else. Even in stone, he could not get to the end.', effects: [{ setFlag: 'ranger.holt_blaze', value: true }], next: 'answer' },
      answer: { speaker: 'narrator', text: 'Your hand fits it exactly. You will answer it the Wayfarer way, with a blaze of your own. But your half-stone has been tugging towards the Stone Court all day, and Holt would say: first things first.', next: null },
      after: { speaker: 'narrator', text: 'Holt’s blaze on the Verdant arch, still white where the knife went in.', next: null },
    },
  },
];

export default dialogues;
