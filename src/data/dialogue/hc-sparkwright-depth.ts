/**
 * Hollow Crown, SPARKWRIGHT Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const TA = 'npc:tess-ampery' as const, VS = 'npc:volta-sterne' as const, MS = 'npc:mortimer-sneddon' as const;
const JG = 'npc:juniper-gauss' as const, WF = 'npc:wilf-farraday' as const, MW = 'npc:marjorie-watt' as const;
const PS = 'npc:prudence-spindle' as const;
const RODS_DONE: NarrativeCondition = { questCompleted: 'quest:sparkwright-rod-duty' };

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
  // ======================= I-1 Every Workshop at Once: the head count, tea with Tess
  {
    id: 'dialogue:area-sparkwright-coil-street', name: 'I-1 banter: Coil Street at one in the morning', bark: true,
    entries: [{ when: stage('quest:sparkwright-every-workshop-at-once', 'street'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'All of Coil Street is out in its nightclothes, comparing explosions. Everybody agrees theirs was the loudest. Everybody is very pleased about it.', next: null } },
  },
  clue('sparkwright-blast-site-1', 'I-1 the Ohms’ workshop', stage('quest:sparkwright-every-workshop-at-once', 'street'),
    'The Ohms’ workshop has no roof. Mr Ohm is sitting in the middle of it in his nightshirt, delighted, taking notes. Mrs Ohm’s hat is on the weathervane, and the weathervane is pointing north.', 'sparkwright.blast_1',
    'The Ohms’ workshop, with a tarpaulin where the roof was.'),
  clue('sparkwright-blast-site-2', 'I-1 the varnish shop', stage('quest:sparkwright-every-workshop-at-once', 'street'),
    'The varnish shop. Everything in the street outside is now very shiny, including the varnisher, who is stuck to his own doorstep and asking politely for a chisel. The scorch on his wall points north.', 'sparkwright.blast_2',
    'The varnish shop, gleaming.'),
  clue('sparkwright-blast-site-3', 'I-1 the bellows-mender’s', stage('quest:sparkwright-every-workshop-at-once', 'street'),
    'The bellows-mender’s, blown clean through. Nobody hurt. But every scorch on Coil Street is a long black finger on the cobbles, and every finger points the same way: north, to the storm over the Copper Gate.', 'sparkwright.scorch_north',
    'The bellows-mender’s, with daylight showing through both walls.', 'As if the whole street had been pulled towards it at once, and then let go.'),
  {
    id: 'dialogue:sparkwright-tess-tea', name: 'I-1 tea with Tess', scope: 'party',
    entries: [{ node: 'in' }],
    nodes: {
      in: { speaker: 'narrator', text: 'Tess’s workshop at two in the morning: forty years of half-inventions, a forge banked low, and nineteen copper kettles on a shelf, every one slightly different. Kettle Twenty walks across the bench and pours the tea, mostly into the cups.', next: 'count' },
      count: {
        speaker: TA, text: 'Well? Everybody breathing? Everybody still got most of a face?',
        choices: [
          { text: 'Nobody hurt. Mrs Ohm’s hat is on the weathervane.', to: 'hat' },
          { text: 'Every scorch on the street points north. At the storm over the Copper Gate.', to: 'north', when: { flag: 'sparkwright.scorch_north' } },
        ],
      },
      hat: { speaker: TA, mood: 'happy', text: 'Good. Good! It’s a terrible hat. The weathervane’s welcome to it. (She drinks her tea in one go, scalding, and doesn’t notice.) Right. Now your chest.', next: 'chest' },
      north: { speaker: TA, mood: 'afraid', text: 'North. Every one? (She puts her cup down.) Then that bell didn’t just shake us. Something out there pulled, and the whole street leaned towards it like iron filings. I don’t like that. I don’t like it at all. Now your chest.', next: 'chest' },
      chest: {
        speaker: TA, text: '(She listens at your ribs again, with an ear-trumpet this time, for science.) Crackling. A kettle a second before the whistle. That’s the Tower half, family, up at the top of the Lightning Tower. Thirty years it’s been up there, sulking, waiting for you.',
        choices: [
          { text: 'You said you were there the night it left.', to: 'night' },
          { text: 'Why me?', to: 'why' },
          { text: '(Hold out your hand. Let it spark.)', to: 'spark', school: 'storm' },
        ],
      },
      night: { speaker: TA, mood: 'sad', text: 'I was in the Tower Crown when the Storm Stone went. I tried to catch it. It went past my ears like a falling kettle, and it took my eyebrows with it, and I have never grown them back, on principle. That’s all you get tonight.', next: 'kettles' },
      why: { speaker: TA, text: 'Nobody knows why a stone chooses. If you ask the Guild, they’ll say merit. If you ask me, it heard you swearing at your bench every night and thought: that one. That one doesn’t give up.', next: 'kettles' },
      spark: { speaker: TA, mood: 'happy', text: '(A spark jumps from your fingertip to the nearest kettle, which whistles one perfect, pure note and falls over.) Oh. Oh! Do that again. No, don’t, Kettle Nine is very old. But oh, family. That note.', next: 'kettles' },
      kettles: {
        speaker: 'narrator', text: 'On the shelf the nineteen kettles sit in a row, each with a brass plate: PATENT 1 OF 19, 2 OF 19, and on. Tess sees you looking.',
        choices: [
          { text: 'Nineteen patents for one kettle?', to: 'nineteen' },
          { text: '(Leave it. It’s two in the morning.)', to: 'rods' },
        ],
      },
      nineteen: { speaker: TA, text: 'Twenty, if you count the one that walks. I am trying to remember a sound, and I haven’t got it right yet. Some day I’ll tell you which. Not tonight. Tonight I have a street to put back.', next: 'rods' },
      rods: {
        speaker: TA, text: 'Tomorrow, you help me put Coil Street back together. The Bell knocked all five of the street’s lightning rods crooked, and if they aren’t reset by Thursday there won’t be a single explosion on this street, and people will think something’s wrong.',
        choices: [
          { text: 'Something is wrong.', to: 'wrong' },
          { text: 'I’ll be on the roofs at first light.', to: 'end', trust: 1 },
        ],
      },
      wrong: { speaker: TA, text: 'Yes. And we’ll fix it, the way we fix everything: carefully, then suddenly, then with a bucket. Go to bed. Kettle Twenty will wake you. Kettle Twenty wakes everybody.', next: 'end' },
      end: { speaker: TA, text: 'Goodnight, family. Welcome home.', next: null },
    },
  },

  // ======================= I-2 Rod Duty: the storm-glass
  clue('sparkwright-storm-glass', 'I-2 the Guild storm-glass', stage('quest:sparkwright-rod-duty', 'glass'),
    'The Guild’s old storm-glass, a tall jar of crystals that grow towards wherever the weather is going. Every crystal in it is straining south, away from the Copper Gate, like dogs pulling at a lead. The storm itself has not moved an inch.', 'sparkwright.storm_pinned',
    'The Guild storm-glass on its stand, crystals leaning.', 'A storm that wants to go, and can’t. Not stuck. Held.'),

  // ======================= I-3 The Witch’s Belfry: into the Spires
  {
    id: 'dialogue:area-sparkwright-spires-walk', name: 'I-3 banter: into the Copper Spires', bark: true,
    entries: [{ when: stage('quest:sparkwright-the-witchs-belfry', 'belfry'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The Copper Spires lean over the street like old men at a bar, every one of them a little further than last week. Somebody has chalked a number on each: 9, 11, 12. Towers that fell. Nobody has chalked a 15 yet.', next: null } },
  },

  // ======================= I-4 The Chancellor’s Tour: the Number Three wheel
  {
    id: 'dialogue:sparkwright-volta-three', name: 'I-4 the Chancellor at Number Three', scope: 'party',
    entries: [{ node: 'wheel' }],
    nodes: {
      wheel: { speaker: 'narrator', text: 'The Number Three wheel, taller than a house, turning steadily, with a woman in a leather apron at the handles, singing to it under her breath. The Chancellor stops in its shadow, exactly where the woman cannot see her.', next: 'three' },
      three: {
        speaker: VS, mood: 'happy', text: 'There. Isn’t she lovely? Three hundred years, and she has never once missed a turn. Every night she keeps the orphanage on Sump Lane warm. That is Marjorie Watt. Marjorie has never missed a turn either.',
        choices: [
          { text: 'Go and say hello to her, then.', to: 'hello' },
          { text: 'You send her oil, every month.', to: 'oil' },
        ],
      },
      hello: { speaker: VS, mood: 'sad', text: '(She doesn’t move.) And say what? “I have filed four hundred memoranda about your wheel and never once learned how you take your tea”? No. I am better at oil.', next: 'towers' },
      oil: { speaker: VS, text: '(A faint colour in her face.) The good oil. Somebody ought to. Machines remember who looked after them. So do people, if you are very careful never to find out.', next: 'towers' },
      towers: {
        speaker: VS, text: 'Fourteen towers have fallen in my lifetime. I can name everyone who was under them. I can recite the names in order, if you like. I do, most nights.',
        choices: [
          { text: 'Tower Fifteen won’t fall.', to: 'fifteen' },
          { text: 'Maybe towers aren’t meant to last for ever.', to: 'ever' },
        ],
      },
      fifteen: { speaker: VS, text: 'No. It won’t. That is the whole of the point. A tower that will not fall, whatever the storm does, whatever the Guild votes, whatever anybody loves. I am going to build one thing in Spirehold that stays.', next: 'vote' },
      ever: { speaker: VS, mood: 'angry', text: 'Spoken like Tess. Tess believes everything should be allowed to fall down so that it can be built again, interestingly. Tess has never had to pull anybody out from under it.', next: 'vote' },
      vote: {
        speaker: VS, text: 'The Guild votes on Tower Fifteen’s coil tomorrow, at its foot, in the Spires. I would like a voice in the room that the Storm Stone chose. Not to agree with me. Just to have been there.',
        choices: [
          { text: 'I’ll be there.', to: 'end', trust: 1, trustNpc: VS },
          { text: 'I’ll be there, and I’ll ask questions first.', to: 'ask' },
        ],
      },
      ask: { speaker: VS, mood: 'happy', text: 'Good. Tess will have told you to. Ask the children with the jars. Ask Wilf, who builds the scaffolds. Then come and vote. That is how a Guild is supposed to work, and almost never does.', next: 'end' },
      end: { speaker: 'narrator', text: 'Behind you, Marjorie Watt finishes her song, and pats the wheel the way you would pat a horse. The Chancellor watches her do it until you have both gone round the corner.', next: null },
    },
  },

  // ======================= I-5 Tower Fifteen: Juniper and Wilf before the vote
  {
    id: 'dialogue:sparkwright-juniper-canvass', name: 'I-5 Juniper before the vote', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: JG, text: 'The vote? About the wisps? (She hugs a jar to her chest. It is empty.) Bobbin lives in here. He’s down the drain at the moment, but he lives in here. If they cage them all, where does he come home to?', effects: [{ setFlag: 'sparkwright.juniper_asked', value: true }], next: 'jar' },
      jar: {
        speaker: JG, text: 'Every child on Coil Street has one. You get your wisp the day you’re born, and it sleeps by your bed so you’re never in the dark. Who decided they were batteries?',
        choices: [
          { text: 'Would you say that to the Guild?', to: 'say' },
          { text: 'Nobody’s decided yet.', to: 'yet' },
        ],
      },
      say: { speaker: JG, mood: 'happy', text: 'To the whole Guild? Out loud? (She thinks about it very seriously.) Only if somebody lifts me up. I’m not tall enough to be listened to.', choices: more(offer('quest:sparkwright-the-wisp-nursery', 'I could go and look for Bobbin.', 'look', RODS_DONE)) },
      yet: { speaker: JG, text: 'Then you decide. You’re the one with the stone in you. Decide properly. Not like the Patent Office.', choices: more(offer('quest:sparkwright-the-wisp-nursery', 'I could go and look for Bobbin.', 'look', RODS_DONE)) },
      look: { speaker: JG, text: 'The wisp nursery’s deep down under the Tower. The hollow ones are eating the little sparks. Please be quick. He likes being sung to.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-wilf-canvass', name: 'I-5 Wilf before the vote', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: WF, text: 'Tower Fifteen? I built the scaffolds for twelve, thirteen and fourteen. (He isn’t smiling, for once.) I was on fourteen when it went. Came down on a glide-cloak. Two of my lads didn’t have theirs on.', effects: [{ setFlag: 'sparkwright.wilf_asked', value: true }], next: 'want' },
      want: {
        speaker: WF, text: 'So I want a tower that stands. More than anybody in this city, I want it. But I’ve seen the cages. You could keep forty children’s lights in each.',
        choices: [
          { text: 'Then which way will you vote?', to: 'which' },
          { text: 'I’m sorry about your lads.', to: 'lads', trust: 1, trustNpc: WF },
        ],
      },
      which: { speaker: WF, text: 'I don’t get a vote. I’m a scaffolder. But if anyone asks me, I’ll tell them what I told you. Ask me.', choices: more(offer('quest:sparkwright-the-spire-jumpers', 'Is that race still on?', 'race', RODS_DONE)) },
      lads: { speaker: WF, mood: 'sad', text: 'Lemmy and Hob. Good jumpers. Rubbish at listening. (He puts his cap back on.) I still teach landing first. Every apprentice. Nobody ever wants to learn it.', choices: more(offer('quest:sparkwright-the-spire-jumpers', 'Is that race still on?', 'race', RODS_DONE)) },
      race: { speaker: WF, text: 'Splendid! Borrow a cloak. Arms out, knees soft, don’t think about the ground. The ground is thinking about you enough for both of you.', next: null },
    },
  },

  // ======================= I-6 The Grand Patent Vault: the steps down
  {
    id: 'dialogue:area-sparkwright-vault-steps', name: 'I-6 banter: down to the Patent Vault', bark: true,
    entries: [{ when: stage('quest:sparkwright-the-grand-patent-vault', 'vault'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'A sign on the Vault stair, very old: INVENTIONS THE GUILD WAS AFRAID OF. Under it, newer: AND ONE TOASTER. Somebody has crossed out the toaster and written: NOT YET.', next: null } },
  },

  // ======================= I-7 Patent Pending: the filing, telling Tess
  {
    id: 'dialogue:sparkwright-mortimer-filing', name: 'I-7 Mortimer on the Perpetual Tower', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: MS, text: 'The Perpetual Tower? (He doesn’t need to look it up.) Filed C. 1012, the week after the Storm Stone left. Applicant: V. Sterne. Status: pending. She renews it in person every year, on the same day, in the same gloves.', next: 'asks' },
      asks: {
        speaker: MS, text: 'And every year she asks me the same thing. “Has anybody objected?” Nobody ever has. You can’t object to a patent nobody’s allowed to read.',
        choices: [
          { text: 'I object.', to: 'object' },
          { text: 'What does she do when you say no?', to: 'no' },
        ],
      },
      object: { speaker: MS, mood: 'afraid', text: '(He stares at you. Then, slowly, he reaches for a stamp he has not used in thirty years.) OBJECTION RECEIVED. (Thump.) Oh my. Oh my word. That felt wonderful. I’m going to need a sit-down.', effects: [{ setFlag: 'sparkwright.patent_objected', value: true }], choices: more(offer('quest:sparkwright-patent-rejected', 'Have you any letters that want posting?', 'post')) },
      no: { speaker: MS, mood: 'sad', text: 'She looks relieved, and then disappointed, and then she thanks me and pays the fee in exact change. Thirty years. I think she was hoping somebody would.', choices: more(offer('quest:sparkwright-patent-rejected', 'Have you any letters that want posting?', 'post')) },
      post: { speaker: MS, text: 'Could you? The top two, then. Wilf Farraday, in the Spires, and Juniper Gauss, aged nine, on Coil Street. I did that one last month. I’ve felt bad about it since.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-tess-anchors', name: 'I-7 Tess learns what holds the storm', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TA, text: 'Well? (She sees your face, and puts the bucket down, which is how you know it is serious.) How many?', next: 'four' },
      four: {
        speaker: 'narrator', text: 'You tell her: four rods as thick as your waist, driven down through the Tower’s roots, stamped PATENT PENDING, V. S., humming like something holding on with its teeth, and the storm at the end of every one, pulling.',
        choices: [
          { text: 'She’s been holding Skyrender over the gate for a year.', to: 'year' },
          { text: 'She filed the patent the week the Storm Stone left. Thirty years ago.', to: 'thirty', when: { flag: 'sparkwright.patent_objected' } },
          { text: 'The storm-glass was right. It isn’t stuck. It’s on a lead.', to: 'lead', when: { flag: 'sparkwright.storm_pinned' } },
        ],
      },
      year: { speaker: TA, mood: 'angry', text: 'A year. A whole year, a whole storm, a whole bird, on a peg. And I sat on my roof and complained about the weather. Oh, I am going to be so very cross, in such detail.', next: 'why' },
      thirty: { speaker: TA, mood: 'sad', text: 'Thirty years. The week I lost my eyebrows trying to catch the stone, she went home and started drawing a cage for it. We were both trying to hold the same thing, family. I just had worse hands.', next: 'why' },
      lead: { speaker: TA, text: 'On a lead. Like a dog that’s been told to stay, and stays, and stays, and goes a bit mad. Skyrender is the weather. You can’t keep the weather on a lead. It goes wrong. It goes black.', next: 'why' },
      why: {
        speaker: TA, text: 'And the crown in the margin. A lightning bolt for every jewel. She doesn’t want a tower. She wants a crown that never has to come off.',
        choices: [
          { text: 'Or she’s just frightened of anything falling ever again.', to: 'afraid', trust: 1 },
          { text: 'Then she has to be stopped.', to: 'stop' },
        ],
      },
      afraid: { speaker: TA, mood: 'sad', text: '(She is quiet for a long while.) Yes. That too. That most of all, probably. The cleverest woman in Spirehold, and she’s spent her whole life trying to build something too heavy to fall on anybody. It’s the kindest dreadful thing I ever heard of.', next: 'crown' },
      stop: { speaker: TA, text: 'Yes. Carefully, then suddenly. Never mind the bucket.', next: 'crown' },
      crown: { speaker: TA, text: 'She’ll be up at the Tower Crown with her cage, waiting for the only person in Spirehold who can lift the stone into it. That’s you. Go up. Don’t let her talk you into tidying anything.', next: 'end' },
      end: {
        speaker: TA, text: 'And, family? If she falls, catch her. I never could.',
        choices: [
          { text: 'I’ll try.', to: null },
          { text: 'I’ll bring her back to Coil Street.', to: 'back' },
        ],
      },
      back: { speaker: TA, mood: 'happy', text: 'Bring her back and I’ll give her a week in my workshop. And this time, she isn’t allowed to label anything.', next: null },
    },
  },

  // ======================= I-9 The Copper Road: the line pylon, the road
  {
    id: 'dialogue:obj-sparkwright-line-pylon', name: 'I-9 the line pylon on the Copper Road', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-the-copper-road', 'pylon'), node: 'pylon' }, { node: 'plain' }],
    nodes: {
      pylon: { speaker: 'narrator', text: 'A Guild pylon halfway up the Copper Road, where the old lightning-line comes down from the Tower Crown. The line is still singing faintly. At the pylon’s foot the snow is scorched in a long black streak, where somebody landed hard and kept going.', next: 'clip' },
      clip: {
        speaker: 'narrator', text: 'Hanging from the line, still smoking, a snapped harness clip, very well made, and in the snow beneath it a single glove, folded neatly in half, as if even while falling she had stopped to put it down tidily.',
        choices: [
          { text: '(Take the glove.)', to: 'glove', effects: [{ setFlag: 'sparkwright.volta_glove', value: true }, { unlockLore: 'lore:hc-storm-lightning-lines' }] },
          { text: '(Leave it folded where it is.)', to: 'leave', effects: [{ unlockLore: 'lore:hc-storm-lightning-lines' }] },
        ],
      },
      glove: { speaker: 'narrator', text: 'Inside the cuff, in tiny neat stitching: V. S. SPARE. The other one, presumably, is still on her hand, somewhere up the road ahead of you, at the gate.', next: null },
      leave: { speaker: 'narrator', text: 'You leave it folded on the pylon’s footing. It seems wrong to unfold anything she folded.', next: null },
      plain: { speaker: 'narrator', text: 'A Guild pylon on the Copper Road, its line humming.', next: null },
    },
  },
  {
    id: 'dialogue:area-sparkwright-copper-road', name: 'I-9 banter: up the Copper Road', bark: true,
    entries: [{ when: stage('quest:sparkwright-the-copper-road', 'road'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Behind you, faint across the whole of Spirehold, Coil Street explodes on the hour, politely, one at a time. Somebody has started it up again. It sounds exactly like home.', next: null } },
  },

  // ======================= Side: the Quiet Workshop (toast for the orphanage)
  {
    id: 'dialogue:sparkwright-marjorie-toast', name: 'The Quiet Workshop: toast for the orphanage', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: MW, text: 'Toast? A crate of it? (She takes a slice, inspects it, bites.) That is perfect toast. Who made perfect toast? On Coil Street? Nobody on Coil Street has made anything perfect in living memory.', next: 'pim' },
      pim: {
        speaker: MW, text: 'Pim Joule? Little Pim? He used to bring his broken things down here to show the wheel. (She stacks the crate by the door.) Forty children on Sump Lane, and every one of them is having toast tomorrow.',
        choices: [
          { text: 'He’s afraid it’s boring.', to: 'boring' },
          { text: 'Tell him it worked. He needs to hear it.', to: 'tell', trust: 1, trustNpc: MW },
        ],
      },
      boring: { speaker: MW, mood: 'happy', text: 'Boring! I’ve turned the same wheel for thirty years. Boring is the best thing in the world, love, when it’s keeping somebody warm. You tell him that from me.', next: null },
      tell: { speaker: MW, mood: 'happy', text: 'I’ll do better. I’ll send him a drawing from every one of them. He can pin them up where his explosions used to go.', next: null },
    },
  },

  // ======================= Side: Patent Rejected (the foundation stone)
  {
    id: 'dialogue:obj-sparkwright-founding-stone', name: 'Patent Rejected: the Lightning Tower’s foundation stone', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-patent-rejected', 'stone'), node: 'stone' }, { node: 'plain' }],
    nodes: {
      stone: { speaker: 'narrator', text: 'Deep in the Foundations, under the first of the copper roots, a great flat stone with a drawing cut into it: a tower, very simple, with lines coming off its top in rings, like sound from a bell. Under it, one word: HUM.', next: 'juniper' },
      juniper: {
        speaker: 'narrator', text: 'It is Juniper’s drawing. Not like it. The same, line for line, as a nine-year-old drew it in crayon and posted it to the Patent Office to be rejected.',
        choices: [
          { text: '(The Tower was built to hum, and the storms came to it.)', to: 'hum', insight: 'tower_hum' },
          { text: '(Take a rubbing of it for Juniper.)', to: 'rub', effects: [{ setFlag: 'sparkwright.stone_rubbing', value: true }] },
        ],
      },
      hum: { speaker: 'narrator', text: 'It never caught a storm in its life. It hummed, and they came. The first builders cut that into the bottom of it so that nobody would forget, and then everybody did, except one little girl who never knew there was anything to remember.', next: 'rub' },
      rub: { speaker: 'narrator', text: 'You lay a sheet over the stone and rub it with charcoal. Juniper is going to frame it. Mortimer is going to have to apologise to it.', next: null },
      plain: { speaker: 'narrator', text: 'The Lightning Tower’s foundation stone, with a humming tower cut into it.', next: null },
    },
  },

  // ======================= Side: the Spire-Jumpers (the apprentices in the tree)
  {
    id: 'dialogue:obj-sparkwright-apprentice-tree', name: 'The Spire-Jumpers: the apprentices in the tree', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-the-spire-jumpers', 'tree'), node: 'tree' }, { node: 'plain' }],
    nodes: {
      tree: {
        speaker: 'narrator', text: 'A copper-beech on the far side of the Spires, the only tree for a mile, with three apprentices in it, wrapped in their glide-cloaks like bats. “We went first,” says one, with dignity. “We’re staying first,” says another.',
        choices: [
          { text: '(Teach them to land, one at a time.)', to: 'teach' },
          { text: '(Tell them Wilf is buying the tea, and he’s already pouring.)', to: 'tea' },
        ],
      },
      teach: { speaker: 'narrator', text: 'Arms out, knees soft, look at where you’re going, not at the ground. One, two, three, they come down out of the copper-beech, and the third one lands on her feet, and screams with delight, and wants to go again at once.', next: null },
      tea: { speaker: 'narrator', text: 'They come down so fast that two of them land in the same bush. Nobody has ever got out of a tree that quickly in the history of the Spire-Jumpers. Wilf is not buying the tea. You will have to.', next: null },
      plain: { speaker: 'narrator', text: 'A copper-beech, broken in places, with a glide-cloak still caught in the top.', next: null },
    },
  },

  // ======================= Side: Wheel Three (the orphanage)
  {
    id: 'dialogue:obj-sparkwright-orphanage-door', name: 'Wheel Three: the orphanage on Sump Lane', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-wheel-three', 'orphanage'), node: 'door' }, { node: 'plain' }],
    nodes: {
      door: { speaker: 'narrator', text: 'The orphanage on Sump Lane, below the Dynamo Halls, warm right through the walls. It is still yellow. The door is propped open, and forty children are arguing about a game that seems to involve a great deal of shouting “Turn!”', next: 'board' },
      board: {
        speaker: 'narrator', text: 'Inside the door is a board covered in drawings, layer on layer, years deep. Every one of them is a big wheel and a small woman, and every one is addressed the same: TO WHOEVER TURNS THE WHEEL. The children never knew where to send them.',
        choices: [
          { text: '(Take the newest drawing to Marjorie.)', to: 'take', effects: [{ setFlag: 'sparkwright.marjorie_drawing', value: true }] },
          { text: '(Tell the children whoever turns the wheel is called Marjorie.)', to: 'tell', effects: [{ setFlag: 'sparkwright.marjorie_named', value: true }] },
        ],
      },
      take: { speaker: 'narrator', text: 'You unpin the top drawing. A big wheel, a small woman, and the sun, all in yellow. When you give it to her, she will hold it at arm’s length and say she can’t read it without her spectacles, and she will not have spectacles on.', next: null },
      tell: { speaker: 'narrator', text: 'Forty children go very quiet. Then one says, “Marjorie,” and another says it, and then they are all writing it on everything, very large. By the end of the week she will have thirty years of post.', next: null },
      plain: { speaker: 'narrator', text: 'The orphanage on Sump Lane, still yellow, still warm.', next: null },
    },
  },

  // ======================= Side: Sentry Sixty-One (the paperwork)
  {
    id: 'dialogue:sparkwright-mortimer-pigeon', name: 'Sentry Sixty-One: Mortimer re-files it', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: MS, text: 'Unit Sixty-One? For scrapping, Thursday, by order of the Chancellery? (He finds the file in under a second.) And you want it… re-classified. As what?', next: 'as' },
      as: {
        speaker: MS, text: 'I can’t just un-scrap a Sentry. There’s a form. There’s always a form. What is it, if it isn’t a Sentry?',
        choices: [
          { text: 'A pigeon.', to: 'pigeon' },
          { text: 'An invention. Nobody has ever patented a Sentry that coos.', to: 'patent' },
        ],
      },
      pigeon: { speaker: MS, mood: 'happy', text: '“Unit Sixty-One: reclassified as livestock. Species: pigeon. Not to be scrapped, under the Livestock Act.” (Thump.) There. The scrap-men will have to take it up with the pigeons. Nobody takes it up with the pigeons.', next: 'end' },
      patent: { speaker: MS, mood: 'happy', text: '“Patent applied for: Sentry, cooing, one.” Status: pending. (Thump.) You can’t scrap a pending patent. It’s the only good thing about pending. I should know.', next: 'end' },
      end: { speaker: MS, text: 'Tell it… tell it congratulations. Do pigeons understand congratulations? Never mind. Coo at it for me.', next: null },
    },
  },

  // ======================= Side: the Root-Tuner (humming Tess the note)
  {
    id: 'dialogue:sparkwright-tess-roots', name: 'The Root-Tuner: Tess hears the roots’ note', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TA, text: 'Ma sent you? What for? (You hum the roots’ note. Halfway through, every kettle on her shelf begins, very softly, to rattle on its base.)', next: 'note' },
      note: {
        speaker: TA, mood: 'afraid', text: 'Again. (You hum it again.) That’s it. That’s the note. Forty years and nineteen kettles, and it’s been in the floor the whole time, under my feet, being tuned by Ma Ohmsworth on her knees.',
        choices: [
          { text: 'It’s the note the Tower sang. The storms came to it.', to: 'came', insight: 'tower_hum' },
          { text: 'Are you crying, Guildmother?', to: 'crying', trust: 1 },
        ],
      },
      came: { speaker: TA, text: 'Came to it. Not caught. Came. (She sits down on an anvil.) My grandmother’s kettle whistled that note, and the lightning struck the Tower every time it boiled. The Guild filed it under Coincidence. Of course they did.', next: 'end' },
      crying: { speaker: TA, mood: 'happy', text: 'It’s the varnish shop. The fumes. Everybody on Coil Street cries a little. (She is crying a great deal.) Thank you, family. I mean it. Don’t you dare tell Ma I cried.', next: 'end' },
      end: { speaker: TA, text: 'Kettle Twenty-One. I can feel it. And this one is going to sing.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds round Spirehold
  {
    id: 'dialogue:obj-storm-capital-ruin-find', name: 'Spirehold ruin: the first workshop', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A blackened shell of a building, roofless for centuries, with a plaque by the door that the Guild still polishes: SITE OF THE FIRST WORKSHOP OF THE COIL GUILD. IT EXPLODED. WE WERE VERY PROUD.', effects: [{ unlockLore: 'lore:hc-storm-capital-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-storm-capital-cave-find', name: 'Spirehold cave: the copper grotto', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'At the back of the cave a seam of raw copper runs through the rock like a vein, and every time the storm grumbles outside, the whole seam hums, very low, the same note the Tower roots sing. The rock around it is smooth with handprints. People have come here to listen for a long time.', effects: [{ unlockLore: 'lore:hc-storm-capital-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-storm-capital-cave-codex', name: 'Spirehold cave: an apprentice’s examination', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A Guild examination paper, tucked in a tin on a ledge. “Question 1: Describe a machine that cannot fail.” The answer, in a child’s hand: “There isn’t one, that’s why it’s fun.” In red ink, a mark of nought, and underneath, in a different red ink: “Passed. — W. Ampery.”', effects: [{ unlockLore: 'lore:hc-storm-capital-exam' }], next: null } },
  },
  {
    id: 'dialogue:obj-storm-capital-view-find', name: 'Spirehold viewpoint: the weathervane walk', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'From the lookout every weathervane in Spirehold can be seen at once, hundreds of them, copper cocks and fish and kettles. For a year every one of them has pointed at the Copper Gate, whichever way the wind blows. A brass plate on the rail reads: THE WEATHER GOES WHERE IT LIKES. The plate is wrong now.', effects: [{ unlockLore: 'lore:hc-storm-capital-view' }], next: null } },
  },
  // ======================= ACT II (wave 2 depth): C-1 the kit-built Spire
  {
    id: 'dialogue:obj-sparkwright-kit-spire', name: 'C-1 the gap in the Cliffstair Spire', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-cliffstair', 'spire'), node: 'spire' }, { node: 'plain' }],
    nodes: {
      spire: { speaker: 'narrator', text: 'The Cliffstair Storm Spire: a lattice tower of brass and copper, beautifully made, bolted together from parts one to five and parts seven to eleven. Between five and seven there is a gap the height of a man, with two loose wires hanging into it like a question.', next: 'manual' },
      manual: { speaker: 'narrator', text: 'The instructions are nailed to the base in a glass case: ten booklets. Part five ends “Now connect the”. Part seven begins “Once connected, stand well back.” The margins are full of Cliffstair handwriting.', next: 'guesses' },
      guesses: {
        speaker: 'narrator', text: 'Four hundred guesses, each one crossed out. “The blue wire to the red wire”: crossed out, singed. “The cat”: crossed out, underlined twice. “Each other, emotionally”: crossed out, with a note beside it: Prudence, really.',
        choices: [
          { text: '(Add guess four hundred and one.)', to: 'guess' },
          { text: '(Look at the wires, not the book.)', to: 'wires', school: 'storm' },
          { text: '(Leave it. Some things want the right part.)', to: 'leave' },
        ],
      },
      guess: { speaker: 'narrator', mood: 'happy', text: 'You write “the lightning-rod to the weathercock” and step back. Nothing happens, with great dignity. Prudence, behind you, crosses it out for you, kindly.', next: 'pru' },
      wires: { speaker: 'narrator', text: 'The loose wires aren’t loose. They are tuned, each one cut to the length of a note, and they hum faintly at each other across the gap, like two people waiting for a third to arrive with the tea.', effects: [{ setFlag: 'sparkwright.spire_tuned', value: true }], next: 'pru' },
      leave: { speaker: 'narrator', text: 'You leave the gap alone. It is the most honest part of the Spire.', next: 'pru' },
      pru: { speaker: PS, text: 'Thirty years. The Spirehold post stopped the very week part six was due. (She pats the tower.) It came in eleven parts because the Guild sends everything in eleven parts. Old Guildmother Ampery designed it. She said it built character.', next: 'crow' },
      crow: { speaker: PS, text: 'Anyway. The Stormcrow. You’ll want to be up that cliff before part six turns up by itself, which, if I’m honest, I’ve stopped expecting.', effects: [{ setFlag: 'sparkwright.part_six_seen', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Cliffstair Storm Spire, with a gap in the middle where part six should be.', next: null },
    },
  },

  // ======================= ACT II, C-2 The News That Never Came: Prudence at the ladder-head
  {
    id: 'dialogue:sparkwright-prudence-ladder', name: 'C-2 Prudence hears the Stormcrow up close', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'At the head of the lightning-ladder, on a ledge just under the nest, Prudence Spindle sits down hard on the rock, windswept, singed and absolutely delighted. Above you the Stormcrow screams.', next: 'pru' },
      pru: { speaker: PS, mood: 'happy', text: 'I rode the lightning. At my age. With my knees. (She grabs your arm.) Listen. I’ve heard it from the bottom for thirty years. From up here you can hear the words.', next: 'crow' },
      crow: {
        speaker: 'narrator', text: 'This close, the scream breaks into pieces. “THE TURNING! The Concordant is crowned! The roads are open! The Spire at Cliffstair is…” Then it stops, mid-word, and starts again from the top.',
        choices: [
          { text: '“The Spire at Cliffstair is” what?', to: 'what' },
          { text: 'It’s stuck. Like a telegraph with the key held down.', to: 'stuck' },
        ],
      },
      what: { speaker: PS, text: 'Lit! That’s what it shouted, every Turning when I was small: “The Spire at Cliffstair is lit!” (She stops.) It’s been trying to say our Spire is lit for thirty years, and it never was.', next: 'news' },
      stuck: { speaker: PS, mood: 'sad', text: 'Key held down. Oh, the poor thing. Sending the same message for thirty years, and nobody ever sent back RECEIVED.', next: 'news' },
      news: {
        speaker: PS, mood: 'sad', text: 'It’s old news. It’s the last good news anybody had. I don’t blame it for holding on.',
        choices: [
          { text: 'Then I’ll give it some new news.', to: 'new', trust: 1 },
          { text: 'I’ll make it stop.', to: 'stop' },
        ],
      },
      new: { speaker: PS, text: 'Do. Tell it something true. (She settles on the ledge and hugs her knees.) I’ll wait here. I want to hear what it says next.', next: null },
      stop: { speaker: PS, text: 'Gently, if you can. It has been very loyal to a very bad piece of news.', next: null },
    },
  },

  // ======================= ACT II, C-3 The Stormcrow: telling Prudence
  {
    id: 'dialogue:sparkwright-prudence-crow', name: 'C-3 Prudence hears the new news', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: PS, text: 'It’s quiet. For the first time since I was twelve, it’s quiet up there. (The whole of Cliffstair is out in the lane, looking up.) What did it say? At the end?',
        choices: [
          { text: 'It asked me what the news was. I told it: the Bell has rung.', to: 'bell' },
          { text: 'It asked if anybody was still listening. I said Cliffstair was.', to: 'listen', trust: 1 },
        ],
      },
      bell: { speaker: PS, text: 'The Bell. (She sits down on the Spire’s step.) Then there’ll be a Turning. A real one. And the Spire won’t be lit for it, for want of part six.', next: 'six' },
      listen: { speaker: PS, mood: 'happy', text: 'We were. Every evening. We set our clocks by it. (She laughs, and wipes her eyes with a sooty cuff, which makes it worse.)', next: 'six' },
      six: {
        speaker: PS, text: 'Thirty years of news that never came, and now it has, and we haven’t a light to show for it.',
        choices: [
          { text: 'Part six will come.', to: 'come' },
          { text: 'Maybe the Spire doesn’t need part six.', to: 'need' },
        ],
      },
      come: { speaker: PS, text: 'You sound like the old Guildmother. Everything arrives in the end, she used to say, including the bill.', next: 'end' },
      need: { speaker: PS, text: '(She looks at the gap in the tower for a long time.) That’s either very wise or very Spirehold. Possibly both.', next: 'end' },
      end: { speaker: PS, text: 'Off you go. Somebody’s been seen in Gildport with a harness and clean cuffs, and the Works-Clerk there has written to me about it four times. In eleven parts.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-prudence-six', name: 'Prudence: part six arrives',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: PS, mood: 'happy', text: 'A KETTLE. Part six is a kettle! (In the gap in the Spire, between the two wires, a Cliffstair kettle is sitting on a bracket, steaming, and the whole tower is humming like a hive.) Thirty years. There were eleven kettles in this village the whole time.', next: 'lit' },
      lit: { speaker: PS, text: 'It isn’t lit, exactly. It hums. The storms come and sit over it like cats on a warm wall. (She sniffs.) Tell the Guildmother it built character.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Machine Age: the black sparks round Gildport
  ...[
    'A scorch on the Gildport clocktower in the shape of a hand: black, not burnt. The fingers are long, and where the cuff brushed the stone it left no soot at all.',
    'A street-lamp on the Gilded Row, rewired in the night with Coil Guild copper, the regulation eleven turns. It burns black. The lamplighter has hung a sign on it: NOT MINE.',
    'A Guild inspection tag tied to the door-handle of the Works, filled in, in the hand you know from every rejection notice in Spirehold: “Fit for purpose. Purpose: crown. V. S., Chancellor.”',
  ].map((text, i): DialogueDef => clue(`sparkwright-black-spark-${i + 1}`, `C-4 the black sparks (${i + 1})`, stage('quest:sparkwright-the-machine-age', 'sparks'),
    text, `sparkwright.sparks_${i + 1}`, 'A faint smell of hot copper, and nothing else.', i === 2 ? 'She signed it. She always signs things. She has never in her life done anything she wasn’t prepared to put her name to.' : undefined)),

  // ======================= ACT II, C-5 The Gilded Engine: the seat in the crown
  clue('sparkwright-volta-seat', 'C-5 the crown Volta ordered', stage('quest:sparkwright-the-gilded-engine', 'seat'),
    'In the Engine’s forge-bed, cooling: a crown the size of a carriage, half forged, with a chair set inside it, upholstered in Guild blue. On the arm of the chair there is a switch. It is in the ON position, and it has been taped there.', 'sparkwright.volta_seat',
    'A half-forged crown in a cold forge-bed.', 'Pinned beside it in her neat hand, the specification: “Seats: one. Must not fall down. Must never fall down.” The last line is underlined so hard that the pen went through the paper.'),

  // ======================= ACT III, Sixty-One Flies Home: the tag
  {
    id: 'dialogue:sparkwright-sixty-one-tag', name: 'Sixty-One Flies Home: answering the tag', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator', text: 'Sixty-One has got itself back down the stairs and onto the cook-tent, which has given up and lain down. It holds out one leg to you, gravely. The tag: PLEASE DIRECT TO HOME. And underneath: “Which is where?”',
        choices: [
          { text: '(Write: SPIREHOLD. ASK FOR TESS.)', to: 'spire', effects: [{ setFlag: 'sparkwright.sixty_home', value: 'spirehold' }] },
          { text: '(Write: WHEREVER I AM.)', to: 'me', effects: [{ setFlag: 'sparkwright.sixty_home', value: 'hero' }] },
          { text: '(Write: HERE.)', to: 'here', effects: [{ setFlag: 'sparkwright.sixty_home', value: 'here' }] },
        ],
      },
      spire: { speaker: 'narrator', text: 'It reads the tag upside down for a long time. Then it tucks its lantern-head under one arm, like a pigeon settling in for a long journey. It will go when you go.', next: null },
      me: { speaker: 'npc:sentry-sixty-one-heart', mood: 'happy', text: 'COO. (It shuffles along the tent until it is as close to you as it can get without sitting on you. Then it sits on you.)', next: null },
      here: { speaker: 'narrator', mood: 'happy', text: 'It considers the word HERE very seriously. It looks round the Heart camp, at the fires and the bearers and the black sky, and settles down on the flattened tent with the air of somebody who was right all along.', next: null },
    },
  },
];

export default dialogues;
