/** Hollow Crown, FALCONER Act III: the nemesis remade, the mentor’s last request and the Heart side quests. Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const WR = 'npc:old-wren' as const, TE = 'npc:hooded-man' as const;
const FREE: NarrativeCondition = { flag: 'falconer.hooding', op: '==', value: 'free' };
const LENT: NarrativeCondition = { flag: 'falconer.hooding', op: '==', value: 'lent' };
const SPARED: NarrativeCondition = { flag: 'falconer.nemesis_fate', op: '==', value: 'spared' };
const DEVOTABLE: NarrativeCondition = { flag: 'falconer.wren_devotable' };
// Pibb flies the last flight if the hero has him, or if he brought the letter himself (no Lodge hawk)
const PIBB: NarrativeCondition = { any: [{ flag: 'falconer.pibb_pet' }, { not: LENT }] };
const LETTER = stage('quest:falconer-wrens-last-flight', 'letter');
// the flight, or the flight missed (the stage was ticked while another scene was open): it can still be flown once
const FLIGHT: NarrativeCondition = { any: [stage('quest:falconer-wrens-last-flight', 'flight'), { all: [{ questCompleted: 'quest:falconer-wrens-last-flight' }, { not: { flag: 'falconer.last_flight' } }] }] };
const UNHOOD = stage('quest:falconer-the-hooded-steadings', 'unhood');
const NEST = stage('quest:falconer-fledglings-grown', 'camp');

const dialogues: DialogueDef[] = [
  // ---------- III-4 The Eyes of the Chimera
  {
    id: 'dialogue:falconer-herald-fate', name: 'III-4 the Eyes of the Chimera: Teodor’s fate', scope: 'party',
    entries: [
      { when: { flag: 'falconer.hooding', op: '==', value: 'hooded' }, node: 'hooded' },
      { when: LENT, node: 'lent' },
      { node: 'free' },
    ],
    nodes: {
      hooded: { speaker: TE, mood: 'hollow', text: '(The Chimera’s eyes have gone dark. Teodor sits on the top stair, hooded, hands folded.) You chose the hood once, at the Mews. Do you remember how quiet the cliffs went? For one night, you understood me.', next: 'calm' },
      lent: { speaker: TE, mood: 'hollow', text: '(The Chimera’s eyes have gone dark. Teodor sits on the top stair, hooded, hands folded.) You sent the Mews hawks to hunt for the Lodge. To be useful. I wanted to be useful once. It’s much quieter, being calm.', next: 'calm' },
      free: { speaker: TE, mood: 'hollow', text: '(The Chimera’s eyes have gone dark. Teodor sits on the top stair, hooded, hands folded.) You flew them free. I watched every bird on the cliffs go round the black like water round a stone. It looked terrifying.', next: 'calm' },
      calm: { speaker: TE, text: 'Shh. It’s all right. Nothing up here is frightened any more. Not the Chimera, not the King. Not me. Isn’t that good? Isn’t that what everyone wanted?', next: 'choose' },
      choose: {
        speaker: TE, mood: 'sad', text: 'You can hood me properly, if you like. For good. I wouldn’t mind. I wouldn’t mind anything. That’s rather the point.',
        choices: [
          {
            text: '[Take his hood off.]', to: 'how', quest: true,
            when: { any: [FREE, { flag: 'falconer.odile_knot' }, { trust: WR, value: 'trusted' }] },
            lockedLabel: 'You need the Mews flown free, Odile’s knot, or Wren’s trust',
            effects: [{ setFlag: 'falconer.nemesis_fate', value: 'spared' }],
          },
          { text: '(Let the hood close over him, for good.)', to: 'destroy', quest: true, effects: [{ setFlag: 'falconer.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      how: {
        speaker: 'narrator', text: 'The hood is soft and black and wet, and it does not want to come off. It has been on him, one way or another, since he was eight years old. Under it, very faintly, someone is holding his breath.',
        choices: [
          { text: '(Cast your hawk at it, the way it struck the hood from the Great Hunt.)', to: 'hawk', when: FREE },
          { text: '(Tie Odile’s knot in its strings, and let him pull.)', to: 'knot', when: { flag: 'falconer.odile_knot' } },
          { text: '(Tell him what Wren told you: a frightened bird is a bird that’s paying attention.)', to: 'words', when: { trust: WR, value: 'trusted' } },
        ],
      },
      hawk: { speaker: 'narrator', text: 'Your hawk comes off your fist low and fast, sees the black as a colour, and takes the hood in one clean pass, the way it learned at the Antler Gate.', next: 'off' },
      knot: { speaker: 'narrator', text: 'You tie the knot Odile taught you, the one that holds until something truly pulls. For a long moment he does not pull. Then, very slowly, he does, and it opens like a hand.', next: 'off' },
      words: { speaker: TE, text: '(He goes still.) She said that to me, when I was eight. I thought she meant I was too frightened to keep. (His shaking hands come up to the hood.) Did she mean that?', next: 'off' },
      off: { speaker: 'narrator', text: 'The hood comes away, wet on the inside. Under it is a young man with a boy’s eyes, blinking in the light of the Heart, and he is terrified.', next: 'afraid' },
      afraid: {
        speaker: TE, mood: 'afraid', text: 'It’s so bright. It’s so loud. Everything is looking at me. (He grabs your sleeve with both hands.) Don’t go. Please. Don’t go anywhere.',
        choices: [
          { text: '(Sit down beside him, and stay.)', to: 'stay' },
          { text: '(Talk to him low and steady, the way you would to a bird just unhooded.)', to: 'stay', school: 'hunt' },
        ],
      },
      stay: { speaker: 'narrator', text: 'You sit with him on the top stair until his hands stop shaking. It takes a long time. He flinches at every sound in the Heart, and turns to look at every one. He is paying attention.', next: null },
      destroy: { speaker: TE, text: 'Thank you. (He settles, the way a hooded bird settles on a fist.) Tell Wren I wasn’t frightened, at the end. It’ll be the first time it’s true.', next: 'destroy2' },
      destroy2: { speaker: 'narrator', text: 'The hood draws down over everything he was, soft as a hand over a candle, and stays. When at last you lift it there is nothing under it but damp leather, and the quiet he always wanted.', next: null },
    },
  },
  // ---------- Wren’s Last Flight (mentor’s last request)
  {
    id: 'dialogue:obj-falconer-camp-perch', name: 'Wren’s Last Flight: the letter on the camp perch', scope: 'party',
    entries: [
      { when: { all: [LETTER, LENT] }, node: 'lodge' },
      { when: { all: [LETTER, { flag: 'falconer.pibb_pet' }] }, node: 'plumley' },
      { when: LETTER, node: 'pibb' },
      { node: 'perch' },
    ],
    nodes: {
      lodge: { speaker: 'narrator', text: 'On the camp perch sits a Mews-bred goshawk in Antlerford jesses, one of the birds the Mews lent the Lodge. It has a letter on its leg, and a second, shorter note: “Hers came to us first. We sent it on. U. B.”', next: 'letter' },
      plumley: { speaker: 'narrator', text: 'On the camp perch, chest out, stands Captain Plumley the moor pigeon, with a letter on his leg. He has now crossed Concordia twice and would like it recorded. Pibb, on your shoulder, looks the other way.', next: 'letter' },
      pibb: { speaker: 'narrator', text: 'On the camp perch sits Pibb, small and cross with the wind, holding out one foot with a letter tied to it. He looks at you hard. Very far away, so does Wren.', next: 'letter' },
      letter: {
        speaker: WR, text: '“Twenty years I’ve seen the Hawkmoor through a kestrel, and never once the Citadel. Nobody on the Mews has. Fly something over it for me, my dear, just once, and I’ll look. Then I’ll have seen everything. W.”',
        choices: [{ text: '(Fold the letter away.)', to: null, quest: true, effects: [{ setFlag: 'falconer.wren_last_letter', value: true }] }],
      },
      perch: { speaker: 'narrator', text: 'A camp perch at the Heart camp, scratched by a good many feet.', next: null },
    },
  },
  {
    id: 'dialogue:obj-falconer-citadel-cast', name: 'Wren’s Last Flight: over the Citadel', scope: 'party',
    entries: [
      { when: { all: [FLIGHT, DEVOTABLE, PIBB] }, node: 'pibbD' },
      { when: { all: [FLIGHT, DEVOTABLE] }, node: 'hawkD' },
      { when: { all: [FLIGHT, PIBB] }, node: 'pibb' },
      { when: FLIGHT, node: 'hawk' },
      { node: 'sky' },
    ],
    nodes: {
      pibb: { speaker: 'narrator', text: 'At the head of the Twelve Stairs you lift your fist, and Pibb goes up: small, vain and furious with the wind, higher than the Citadel’s broken towers. Very far away, on a ledge over the Hawkmoor, an old woman is looking.', next: 'seen' },
      pibbD: { speaker: 'narrator', text: 'At the head of the Twelve Stairs you lift your fist, and Pibb goes up: small, vain and furious with the wind, higher than the Citadel’s broken towers. Very far away, on a ledge over the Hawkmoor, an old woman is looking.', next: 'devoted' },
      hawk: { speaker: 'narrator', text: 'Wren always said any bird she taught you to fly would lend her its eyes, if it liked her. Your hawk goes up off your fist, higher than the Citadel’s broken towers. It has always liked her.', next: 'seen' },
      hawkD: { speaker: 'narrator', text: 'Wren always said any bird she taught you to fly would lend her its eyes, if it liked her. Your hawk goes up off your fist, higher than the Citadel’s broken towers. It has always liked her.', next: 'devoted' },
      seen: {
        speaker: 'narrator', text: 'It circles the Citadel three times, slowly, as if somebody had asked it to, and comes back down to you. Tonight, you are sure, an old woman on the Mews Cliffs is telling everyone who will listen what the Citadel looks like.',
        effects: [{ setFlag: 'falconer.last_flight', value: true }], next: null,
      },
      devoted: {
        speaker: WR, mood: 'happy', text: '(Very far away, through the bird’s eyes, an old woman laughs, and then stops laughing.) Oh. Oh, look at it. All those towers, and the light on them. Thank you, my dear. Now I’ve seen everything.',
        effects: [{ setFlag: 'falconer.last_flight', value: true }, { trust: WR, set: 5 }], next: null,
      },
      sky: { speaker: 'narrator', text: 'The sky over the Citadel, and one small bird still turning in it.', next: null },
    },
  },
  // ---------- The Hooded Steadings
  {
    id: 'dialogue:obj-falconer-hooded-steader-1', name: 'The Hooded Steadings: the old man', scope: 'party',
    entries: [{ when: UNHOOD, node: 'old' }, { node: 'plain' }],
    nodes: {
      old: {
        speaker: 'narrator', text: 'An old man in a Windscour smock, standing in the Legion’s ranks in a soft black hood, smiling. Your half-stone hums as you come near, and the hood loosens, like a knot pulled the right way.',
        choices: [{ text: '[Lift it off.]', to: 'off' }],
      },
      off: {
        speaker: 'narrator', text: 'He blinks, and finishes a sentence he must have started years ago: “…and that’s why you never buy a goat off a man in a hat.” Then he sees where he is, and his knees go.',
        choices: [
          { text: '(Hold him up, and stay until he can stand.)', to: 'stay' },
          { text: '(Talk to him low and dull and steady, about goats, until he stops shaking.)', to: 'stay', school: 'hunt' },
        ],
      },
      stay: { speaker: 'narrator', text: 'It takes a while. He holds onto your arm the whole time, and tells you about the man in the hat, twice. He is frightened, and he is here.', next: null },
      plain: { speaker: 'narrator', text: 'An old man from the Windscour, sitting on an upturned crate, telling a bearer about goats.', next: null },
    },
  },
  {
    id: 'dialogue:obj-falconer-hooded-steader-2', name: 'The Hooded Steadings: the shepherd', scope: 'party',
    entries: [{ when: UNHOOD, node: 'shepherd' }, { node: 'plain' }],
    nodes: {
      shepherd: {
        speaker: 'narrator', text: 'A shepherd with her crook still in her hand, hooded and smiling. When the hood comes away she cries out once, and then stands very still, looking at everything at once, the way a hawk does when it is first unhooded.',
        choices: [
          { text: '(Stand beside her, not touching, and wait.)', to: 'wait' },
          { text: '(Tell her where she is, slowly.)', to: 'tell' },
        ],
      },
      wait: { speaker: 'narrator', text: 'You stand beside her until her breathing slows. It takes a long time, and you do not hurry it. Then she asks, very quietly, whether anybody fed the dog.', next: null },
      tell: { speaker: 'narrator', text: 'You tell her: the Heart, the Bell, the bearers, the years. She listens to all of it with her eyes wide and her knuckles white on the crook. Then she asks whether anybody fed the dog.', next: null },
      plain: { speaker: 'narrator', text: 'A shepherd from the Windscour, leaning on her crook, watching the camp very carefully.', next: null },
    },
  },
  {
    id: 'dialogue:obj-falconer-hooded-steader-3', name: 'The Hooded Steadings: the falconer', scope: 'party',
    entries: [{ when: { all: [UNHOOD, SPARED] }, node: 'teodor' }, { when: UNHOOD, node: 'glove' }, { node: 'plain' }],
    nodes: {
      teodor: { speaker: 'narrator', text: 'Teodor Tanager has followed you down from the stairs, unhooded, flinching at every sound. He stops in front of the last of them, a woman with a falconer’s glove on her fist, and lifts her hood off with his own shaking hands.', next: 'teodor2' },
      teodor2: { speaker: TE, mood: 'afraid', text: 'I’m sorry. I’m so sorry. It’s going to be frightening now. (She grips his arm.) I know. I’ll stay. I’m frightened too. We can be frightened together.', next: null },
      glove: {
        speaker: 'narrator', text: 'The last of them is a woman with a falconer’s glove on her fist and no bird on it. When the hood comes away she looks straight at the empty glove, and her face crumples.',
        choices: [
          { text: '(Hold your own fist beside hers, with your hawk on it.)', to: 'hawk' },
          { text: '(Stay with her.)', to: 'stay' },
        ],
      },
      hawk: { speaker: 'narrator', text: 'Your hawk looks at her glove, and steps across onto it, as if it had been asked. She stops crying. She is shaking, and she is looking at it, and that is the right way round.', next: null },
      stay: { speaker: 'narrator', text: 'You stay with her until she can bear to take the glove off. She folds it and puts it in her pocket, very carefully. She is frightened, and she is paying attention.', next: null },
      plain: { speaker: 'narrator', text: 'A falconer from the Windscour, unhooded, watching the sky over the camp.', next: null },
    },
  },
  // ---------- Fledglings Grown
  {
    id: 'dialogue:obj-falconer-grown-fledglings', name: 'Fledglings Grown', scope: 'party',
    entries: [{ when: { all: [NEST, SPARED] }, node: 'teodor' }, { when: NEST, node: 'four' }, { node: 'plain' }],
    nodes: {
      teodor: { speaker: 'narrator', text: 'Teodor Tanager, unhooded, is sitting under a tent at the Heart camp with his hands over his head. Four young hawks are sitting on the ridge-pole above him. He has not asked anybody to make them stop.', next: 'four' },
      four: {
        speaker: 'narrator', text: 'They are the Featherfall fledglings, grown, without a speck of black on any of them. The biggest one is biting the tent. The smallest one is biting the biggest one. They have come a very long way to be annoying.',
        choices: [
          { text: 'Go home. The Featherfall is clean now. Go on.', to: 'stay' },
          { text: '(Hold up a spare hood, to see what they do.)', to: 'hood' },
          { text: '(Lift your fist, and let them choose.)', to: 'fist', school: 'hunt' },
        ],
      },
      stay: { speaker: 'narrator', text: 'They look at you, and at the sky, and at each other, and do not go. The smallest one shuffles a little closer along the ridge-pole, which is answer enough.', next: 'end' },
      hood: { speaker: 'narrator', text: 'The smallest one takes it out of your hand in one neat snatch, flies to the top of the tent, and pulls it to pieces stitch by stitch while the other three watch with professional interest.', next: 'end' },
      fist: { speaker: 'narrator', text: 'All four come down at once and try to land on the same fist. Nobody wins. They settle in a row along your arm instead, gripping hard, and your own hawk gives you a look.', next: 'end' },
      end: {
        speaker: 'narrator', text: 'They won’t be hooded, and they won’t leave. When you climb to the Citadel they will fly ahead of you, untidy and shrieking, and swerve round every black place in the Heart as if they had always known how.',
        effects: [{ setFlag: 'falconer.fledglings_grown', value: true }], next: null,
      },
      plain: { speaker: 'narrator', text: 'Four young hawks on a tent’s ridge-pole, asleep in a row.', next: null },
    },
  },
];

export default dialogues;
