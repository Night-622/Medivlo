/**
 * Hollow Crown, SKALD Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const DUSK: NarrativeCondition = { hour: [19, 4] };
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const RG = 'npc:ragna-saga-keeper' as const, UL = 'npc:ulf-the-unsung' as const;
const AS = 'npc:asta' as const, EO = 'npc:eskil-ottarsson' as const;
const HG = 'npc:old-hallgerd' as const, EB = 'npc:ebba-coldrey' as const;

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
  // ======================= I-1 The Bell on the Fells: up to the Saga Hall at night
  {
    id: 'dialogue:area-skald-hall-path', name: 'I-1 banter: up to the Saga Hall', bark: true,
    entries: [{ when: stage('quest:skald-the-bell-on-the-fells', 'hall'), node: 'b' }],
    nodes: { b: { speaker: RG, text: '(Ahead of you on the path, her lamp swinging.) Mind the third stile. Or the fourth. One of the stiles. Mind all the stiles, little one.', next: null } },
  },
  {
    id: 'dialogue:skald-ragna-skins', name: 'I-1 the drum-skins in the Saga Hall', scope: 'party',
    entries: [{ node: 'in' }],
    nodes: {
      in: { speaker: 'narrator', text: 'The Saga Hall at night, its long fire banked, its walls hung with nine hundred drum-skins, one for every saga, each painted with that saga’s mark. Ragna lights one lamp and holds it up to the wall.', next: 'wall' },
      wall: {
        speaker: RG, text: 'There. Nine hundred. When I was a girl I knew every one. Now some nights I walk along here and some of the skins are only pictures.',
        choices: [
          { text: 'Which ones have you lost?', to: 'lost' },
          { text: '(Drum the first saga’s opening beat on the nearest skin.)', to: 'drum', school: 'song' },
          { text: 'Why bring me here tonight?', to: 'why' },
        ],
      },
      lost: { speaker: RG, mood: 'sad', text: 'Forty-one, at the last count. I mark them with a notch on my staff, so I know where the holes are. Hrolf Two-Hats is going, I think. A shame. It is very funny.', next: 'first' },
      drum: { speaker: 'narrator', text: 'The skin booms, and every drum on the wall shivers in answer, nine hundred faint echoes, and Ragna laughs out loud: the first time you have heard her laugh in a month.', next: 'first' },
      why: { speaker: RG, text: 'Because the stone in you sang, and the first Skald’s skin sang back. I heard it from my bed. Look.', next: 'first' },
      first: {
        speaker: 'narrator', text: 'At the end of the hall hangs the oldest skin of all, cracked and brown: the first Skald, sitting with a drum across his knees and his hands held out. Painted in his hands, very faded, is a little white stone, split in two.',
        choices: [
          { text: 'That’s the Fell half.', to: 'half' },
          { text: 'Who was he?', to: 'who' },
        ],
      },
      half: { speaker: RG, text: 'It is. It always was. We have painted it there for a thousand years and nobody ever asked what it was. We are Skalds. We remember things. We do not always think about them.', next: 'bed' },
      who: { speaker: RG, text: 'The first of us. He drummed the Fells awake, the saga says, and they have answered ever since. He is buried under the Saga Stones. We call it the Echo Barrow, and nobody goes in.', next: 'bed' },
      bed: { speaker: RG, text: 'Tomorrow, the relay. Drum the news down the valleys, so the Fells hear it from one of us and not from the harpies. Tonight you sleep by this fire. I will sit up and try to remember Hrolf.', next: null },
    },
  },

  // ======================= I-4 Ulf Comes Home: up Scarrow Pike
  {
    id: 'dialogue:area-skald-pike-climb', name: 'I-4 banter: up Scarrow Pike', bark: true,
    entries: [{ when: stage('quest:skald-ulf-comes-home', 'pike'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Ulf climbs ahead of you without once looking down, tapping the climbing-beat on his chest with two fingers: the one Ragna taught you both, so that neither of you would ever get lost in the mist.', next: null } },
  },
  {
    id: 'dialogue:skald-ulf-pike', name: 'I-4 Ulf on Scarrow Pike', scope: 'party',
    entries: [{ node: 'in' }],
    nodes: {
      in: { speaker: 'narrator', text: 'The top of Scarrow Pike at dusk, the Fells falling away on every side into mist. Ulf sits on the summit cairn with his drum, the way he did when you were both children and he was always the one who climbed it first.', next: 'drum' },
      drum: {
        speaker: UL, text: '(He drums the opening beat of the first saga at the sky. The Fells take it and throw it back from every crag, and for a moment it sounds like a voice: his voice, the one he never had.)',
        choices: [
          { text: '(Drum the next beat with him.)', to: 'with' },
          { text: 'Is this why you used to come up here?', to: 'why' },
          { text: '(Sing the words while he drums.)', to: 'sing', school: 'song' },
        ],
      },
      with: { speaker: 'narrator', text: 'You drum together, the way Ragna taught you, his hands and yours. The Fells give it back in two voices, and Ulf shuts his eyes.', next: 'talk' },
      why: { speaker: UL, text: '(He nods. Drums: Up here the Fells sing for me. Down there, nobody hears a drum as a voice. Only as a drum.)', next: 'talk' },
      sing: { speaker: 'narrator', text: 'You sing the words over his beat. He stops dead and stares at you, and then, very slowly, starts again, quieter, so as not to drown you out. The Fells sing both back.', next: 'talk' },
      talk: {
        speaker: UL, text: '(He lays his hand flat on the skin to stop it ringing. Drums: Seven years at the gate. The Maestro took the little voice I had. I minded less than I should have. I never had much to lose.)',
        choices: [
          { text: 'You had the sagas. All nine hundred.', to: 'sagas' },
          { text: 'I mind. I mind for you.', to: 'mind', trust: 1 },
        ],
      },
      sagas: { speaker: UL, text: '(Drums: The sagas had me. Not the same.) (He looks down at the Saga Stones far below, going blank.)', next: 'end' },
      mind: { speaker: UL, mood: 'sad', text: '(He looks at you for a long time. Then he drums, very softly: That is why I came home.)', next: 'end' },
      end: { speaker: UL, text: '(Drums: Go to Ragna. Tell her I am home. Tell her I am well.) (He is not.)', next: null },
    },
  },

  // ======================= I-5 The Blank Stones: canvassing, the night after the moot
  {
    id: 'dialogue:skald-asta-canvass', name: 'I-5 Asta on the stones', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: AS, text: '(She is on her knees by a stone with charcoal and a scrap of bark.) They’re going to choose, aren’t they. Which ones to keep. This one’s my granny’s brother. He wasn’t a hero. He drowned getting a sheep out of the tarn.',
        choices: [
          { text: 'Would you keep his?', to: 'keep' },
          { text: 'What if they keep only the great ones?', to: 'great' },
        ],
      },
      keep: { speaker: AS, text: 'I’d keep everybody’s. That’s silly, I know. There isn’t the stone. But nobody asked the sheep what it thought, and the sheep lived.', next: 'end' },
      great: { speaker: AS, mood: 'sad', text: 'Then I’ll rub his before they let it go. I’m quicker than the weather. Mostly.', next: 'end' },
      end: { speaker: AS, text: 'Say something good at the moot. Say it twice. The Fells only believe things they hear twice.', choices: more(offer('quest:skald-rubbings', 'Do you need anything for the rubbings?', 'paper')) },
      paper: { speaker: AS, mood: 'happy', text: 'Paper! Real paper, not bark. Bark smudges. Try the Saga Hall, and the drum-maker, and anyone who wraps things. Everyone wraps things.', next: null },
    },
  },
  {
    id: 'dialogue:skald-eskil-canvass', name: 'I-5 Eskil on the stones', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: EO, text: 'The stones? (He taps his relay drum.) The relay drums the sagas valley to valley every midwinter. If a stone goes blank the relay still has it, as long as somebody drums it. Until somebody forgets.',
        choices: [
          { text: 'So the stones don’t matter?', to: 'matter' },
          { text: 'Which would you save?', to: 'save' },
        ],
      },
      matter: { speaker: EO, text: 'They matter. They’re what we check against when the relay goes wrong. You heard it: “the Bell rang” came back “the Bell drowned”. Without the stones, who would know which was true?', next: 'end' },
      save: { speaker: EO, mood: 'sad', text: 'The ones nobody drums any more. The heroes get drummed every winter. They’ll never go. It’s the little ones that slip.', next: 'end' },
      end: { speaker: EO, text: 'Drum it true at the moot. That’s all a relay-drummer ever asks.', choices: more(offer('quest:skald-news-from-two-valleys', 'What’s the latest on the relay?', 'news')) },
      news: { speaker: EO, text: 'Old Hulda of Brackenhow has died, then married, then been turned into a cow, in that order. I have my doubts about the cow. Somebody ought to walk over and look.', next: null },
    },
  },
  {
    id: 'dialogue:obj-skald-moot-torch', name: 'I-5 the ring by torchlight', scope: 'party',
    entries: [
      { when: { all: [stage('quest:skald-the-blank-stones', 'torches'), { flag: 'skald.stones', value: 'great' }] }, node: 'great' },
      { when: { all: [stage('quest:skald-the-blank-stones', 'torches'), { flag: 'skald.stones', value: 'weather' }] }, node: 'weather' },
      { when: stage('quest:skald-the-blank-stones', 'torches'), node: 'unsung' },
      { node: 'plain' },
    ],
    nodes: {
      great: { speaker: 'narrator', text: 'By torchlight the Halls cut the founding saga deeper, chisel by chisel, the Jarl of Scarrow and his dragon coming up out of the stone as sharp as the day they were first cut. Nobody cuts the small stones. Nobody can.', effects: [{ setFlag: 'skald.torch_night', value: true }], next: null },
      weather: { speaker: 'narrator', text: 'Tonight the Halls leave their chisels in a heap by the ring. The wind comes over the Fells and across the stones, and you can almost hear the sagas going, a little at a time, like breath.', effects: [{ setFlag: 'skald.torch_night', value: true }], next: null },
      unsung: { speaker: 'narrator', text: 'By torchlight Brynja cuts the first new name on a stone that never had one: a cook from Hoddersgill, who fed the hall for fifty years. Asta holds the torch. The Fells say the name back twice.', effects: [{ setFlag: 'skald.torch_night', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The ring of the Saga Stones, with burnt-out torches in the grass.', next: null },
    },
  },

  // ======================= I-6 The Harpy Roost: the dropped echoes
  {
    id: 'dialogue:area-skald-harpy-path', name: 'I-6 banter: the Harpy Cliffs path', bark: true,
    entries: [{ when: stage('quest:skald-the-harpy-roost', 'cliffs'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Somewhere above you on the cliffs a harpy is shrieking the moot back wrong: Brynja’s voice, Ylva’s, yours, all mixed up together like a hall after too much mead.', next: null } },
  },
  clue('skald-stolen-echo-1', 'I-6 a dropped echo (1)', stage('quest:skald-the-harpy-roost', 'cliffs'),
    'A white stone on the cliff path that bleats when you touch it, in your own voice. A harpy dropped it here: a lamb’s cry, stolen off a fold and stuck to the first thing it hit.', 'skald.echo_1',
    'A white stone on the cliff path. It is quiet now.'),
  clue('skald-stolen-echo-2', 'I-6 a dropped echo (2)', stage('quest:skald-the-harpy-roost', 'cliffs'),
    'A carver’s chisel lying in the heather, and when you pick it up a man’s voice comes out of the rock beside it, shouting for his chisel, over and over, cross and frightened. It belongs to the chisel. The man is safe at home.', 'skald.echo_2',
    'A chisel in the heather, returned to its owner’s stead.'),
  clue('skald-stolen-echo-3', 'I-6 a dropped echo (3)', stage('quest:skald-the-harpy-roost', 'cliffs'),
    'Near the top, a long drum-message beating faintly out of a crack in the rock, the way a dropped echo does until it fades: knots and beats you know from childhood. Ulf’s hand. Something he sent by harpy that the harpy kept.', 'skald.echo_drum',
    'A crack in the rock near the top of the cliffs.', 'It is too broken to read. Whatever it said, the rest of it is in the roost.'),

  // ======================= I-7 The Weeping Runes: the ring at dusk
  {
    id: 'dialogue:obj-skald-dusk-stones', name: 'I-7 the Saga Stones at dusk', scope: 'party',
    entries: [
      { when: { all: [stage('quest:skald-the-weeping-runes', 'dusk'), DUSK] }, node: 'dusk' },
      { when: stage('quest:skald-the-weeping-runes', 'dusk'), node: 'day' },
      { node: 'plain' },
    ],
    nodes: {
      day: { speaker: 'narrator', text: 'Ulf’s carvings are dry in the daylight. Ragna said they weep at dusk.', next: null },
      dusk: {
        speaker: 'narrator', text: 'At sundown the whole ring weeps. Every saga Ulf re-cut runs black down its stone at once, slowly, the way a face does when somebody has held it still for too long. The blank stones beside them stay dry.',
        choices: [
          { text: '(Put your hand into the black.)', to: 'hand', effects: [{ setFlag: 'skald.dusk_watched', value: true }] },
          { text: '(Sing one of the weeping sagas aloud, so it is heard once more.)', to: 'sing', school: 'song', effects: [{ setFlag: 'skald.dusk_watched', value: true }] },
        ],
      },
      hand: { speaker: 'narrator', text: 'It is cold and it does not stain. When you take your hand away, the rune under it has stopped weeping, just that one, for as long as your hand was there. Then it starts again.', next: null },
      sing: { speaker: 'narrator', text: 'You sing the founding saga to its own stone, the way it was meant to be heard. For one verse the black stops running. Deep under the ring, the Fell half sings with you.', next: null },
      plain: { speaker: 'narrator', text: 'The ring of the Saga Stones, dry in the evening light.', next: null },
    },
  },

  // ======================= I-9 Ragna’s Last Saga: the Last Echo
  {
    id: 'dialogue:area-skald-last-road', name: 'I-9 banter: off the Fells', bark: true,
    entries: [{ when: stage('quest:skald-ragnas-last-saga', 'echo'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Behind you the relay drums are passing your name from valley to valley, each one a little fainter, like a song being carried out of a room.', next: null } },
  },
  {
    id: 'dialogue:obj-skald-last-echo', name: 'I-9 the Last Echo', scope: 'party',
    entries: [{ when: stage('quest:skald-ragnas-last-saga', 'echo'), node: 'rock' }, { node: 'plain' }],
    nodes: {
      rock: {
        speaker: 'narrator', text: 'Where the road leaves the Fells stands a split boulder called the Last Echo: the last place the Fells will answer you. Skalds going down to the Turning shouted their names into it, so the Fells would keep them until they came home.',
        choices: [
          { text: '(Shout your name into the Last Echo.)', to: 'shout', effects: [{ unlockLore: 'lore:hc-skald-last-echo' }] },
          { text: '(Drum Ulf’s name into it instead.)', to: 'ulf', school: 'song', effects: [{ unlockLore: 'lore:hc-skald-last-echo' }] },
        ],
      },
      shout: { speaker: 'narrator', text: 'The Fells take your name and pass it back, crag to crag, all the way up to the Drum-Steads, where somebody on drum-watch beats it once, to say they heard.', next: null },
      ulf: { speaker: 'narrator', text: 'You drum his name. For a long moment the Fells say nothing. Then, very faint and very far, they give it back: not in a drum. In a voice, plain and rough, that you have never heard.', next: null },
      plain: { speaker: 'narrator', text: 'The Last Echo, a split boulder by the road. It says your name back, if you ask it.', next: null },
    },
  },

  // ======================= Side: the Ewe Who Sang (Bluebell on the relay)
  {
    id: 'dialogue:obj-skald-bluebell-drum', name: 'The Ewe Who Sang: Bluebell tries the relay', scope: 'party',
    entries: [{ when: stage('quest:skald-the-ewe-who-sang', 'drum'), node: 'drum' }, { node: 'plain' }],
    nodes: {
      drum: {
        speaker: 'narrator', text: 'The high relay drum stands under its little roof, and Bluebell stands beside it, sniffing it. You beat the news. She bleats it after you, a perfect A, so clear that two valleys over a drum answers.',
        choices: [
          { text: '(Let her take the whole relay.)', to: 'relay', effects: [{ setFlag: 'skald.bluebell_drum', value: 'relay' }] },
          { text: '(Drum a fifth under her A.)', to: 'harm', school: 'song', effects: [{ setFlag: 'skald.bluebell_drum', value: 'harmony' }] },
          { text: '(Thank her, and walk her home.)', to: 'home', effects: [{ setFlag: 'skald.bluebell_drum', value: 'home' }] },
        ],
      },
      relay: { speaker: 'narrator', text: 'She bleats the whole message, beat for beat, and the next stead drums it on perfectly for the first time in a week. It turns out a relay needs one creature on the Fells who does not prefer a better story.', next: null },
      harm: { speaker: 'narrator', text: 'You drum a fifth under her A, and the two notes go down the valley together, and three steads’ worth of sheep stop grazing to listen.', next: null },
      home: { speaker: 'narrator', text: 'She bleats once more, for herself, and follows you down the hill. Sigrun says she always knew. Sigrun says she has known since Bluebell was a lamb.', next: null },
      plain: { speaker: 'narrator', text: 'The high relay drum under its little roof.', next: null },
    },
  },

  // ======================= Side: News from Two Valleys Over (the middle stead)
  {
    id: 'dialogue:obj-skald-middle-stead-drum', name: 'News from Two Valleys Over: the middle stead', scope: 'party',
    entries: [{ when: stage('quest:skald-news-from-two-valleys', 'middle'), node: 'roof' }, { node: 'plain' }],
    nodes: {
      roof: {
        speaker: 'narrator', text: 'On the roof of the middle stead a lad of about ten is beating the relay drum with tremendous enthusiasm, a woollen hat pulled right down over both ears against the cold. He cannot hear a thing. He has been guessing.',
        choices: [
          { text: '(Lift his hat, gently.)', to: 'hat' },
          { text: '(Drum him the real message slowly, with your hands where he can see them.)', to: 'hands', school: 'song' },
          { text: '(Tell him to wear the hat on his head, not his ears.)', to: 'ears' },
        ],
      },
      hat: { speaker: 'narrator', text: 'He hears the next valley’s drum for the first time all winter and nearly falls off the roof. “Oh,” he says. “Oh. That’s not cow, is it.” It was never cow.', next: null },
      hands: { speaker: 'narrator', text: 'He watches your hands and drums it after you, beat for beat, and gets it right first time. He says he is going to drum everything with his eyes from now on. Eskil will be pleased, eventually.', next: null },
      ears: { speaker: 'narrator', text: 'He pushes the hat up an inch, and the whole valley comes into his ears at once. He goes very red. Then he drums an apology down the relay to Brackenhow, which Hulda will certainly hear.', next: null },
      plain: { speaker: 'narrator', text: 'The middle stead’s relay drum, beating true.', next: null },
    },
  },

  // ======================= Side: What the Fell Said (Gunnvor’s answer)
  {
    id: 'dialogue:obj-skald-torsten-ledge', name: 'What the Fell Said: Gunnvor’s answer', scope: 'party',
    entries: [{ when: stage('quest:skald-what-the-fell-said', 'ledge'), node: 'ledge' }, { node: 'plain' }],
    nodes: {
      ledge: { speaker: 'narrator', text: 'Halfway up Scarrow Pike, a ledge no wider than a doorstep where the path goes round a rock. A shepherd’s crook is still wedged in the crack, forty years grey.', next: 'answer' },
      answer: {
        speaker: 'narrator', text: 'Gunnvor’s answer is short. She made you learn it by heart before you set off: “Torsten, you daft article. Kettle’s on. Nobody else either.”',
        choices: [
          { text: '(Say it to the Fell, loudly, the way she said it to you.)', to: 'say', effects: [{ setFlag: 'skald.gunnvor_answer', value: 'said' }] },
          { text: '(Drum it, so the Fell carries it further.)', to: 'drum', school: 'song', effects: [{ setFlag: 'skald.gunnvor_answer', value: 'drummed' }] },
        ],
      },
      say: { speaker: 'narrator', text: 'The Fell takes it and carries it round the mountain, and somewhere far off a crow answers, sounding exactly like a man laughing.', next: null },
      drum: { speaker: 'narrator', text: 'The Fell takes the beat and runs with it, crag to crag, until the whole valley is saying it at once. Down at her door, very small, you can see Gunnvor put her hand over her mouth.', next: null },
      plain: { speaker: 'narrator', text: 'A narrow ledge on Scarrow Pike, with an old crook wedged in the rock.', next: null },
    },
  },

  // ======================= Side: the Lost Flock (Fetch’s grave)
  {
    id: 'dialogue:obj-skald-fetch-grave', name: 'The Lost Flock: Fetch’s grave', scope: 'party',
    entries: [{ when: stage('quest:skald-the-lost-flock', 'cairn'), node: 'grave' }, { node: 'plain' }],
    nodes: {
      grave: {
        speaker: 'narrator', text: 'By the tarn wall, a long low mound, grassed over, with no stone on it at all. You lay Fetch’s collar on top, and a stone on the collar, and then, because it seems right, another.',
        choices: [
          { text: '(Whistle Fetch’s whistle, once.)', to: 'whistle', effects: [{ setFlag: 'skald.fetch_grave', value: true }] },
          { text: '(Leave it quiet.)', to: 'quiet', effects: [{ setFlag: 'skald.fetch_grave', value: true }] },
        ],
      },
      whistle: { speaker: 'narrator', text: 'Up on the hill, every one of Kolbein’s sheep turns round at once and looks towards the tarn wall, the way they used to when a dog was coming.', next: null },
      quiet: { speaker: 'narrator', text: 'The tarn is still. A wagtail lands on the new stone, considers it, and approves.', next: null },
      plain: { speaker: 'narrator', text: 'A dog’s grave by the tarn wall, with two stones and a collar on it.', next: null },
    },
  },

  // ======================= Side: the Stone with No Saga (telling Ragna)
  {
    id: 'dialogue:skald-ragna-stone', name: 'The Stone with No Saga: Ragna', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RG, mood: 'sad', text: 'His own saga. On the stone nobody cuts. (She sits down slowly.) I never made him one, little one. I made sagas for every chief who ever broke wind at a feast, and never one for the boy under my table.',
        choices: [
          { text: 'Make one now.', to: 'now' },
          { text: 'He wouldn’t want it drummed.', to: 'drummed' },
        ],
      },
      now: { speaker: RG, text: 'I can’t. I would lose it in a week. (She looks at you.) But you could keep it, if I told it to you. Not yet. When he is home properly. Remind me.', effects: [{ setFlag: 'skald.ulf_saga_promised', value: true }], next: 'end' },
      drummed: { speaker: RG, text: 'No. He would want it cut, so nobody had to sing it. That is the whole trouble with him, and it always was.', next: 'end' },
      end: { speaker: RG, text: 'Thank you for telling me first. The Halls would have told me in the wrong order, and twice.', next: null },
    },
  },

  // ======================= Side: Rubbings (the drove stone)
  {
    id: 'dialogue:obj-skald-drove-stone', name: 'Rubbings: the drove stone', scope: 'party',
    entries: [{ when: stage('quest:skald-rubbings', 'last'), node: 'rub' }, { node: 'plain' }],
    nodes: {
      rub: { speaker: 'narrator', text: 'Out by the old drove track, past the ring, stands the oldest stone of all, worn almost smooth. Asta lays her last sheet over it and rubs, and rubs, and slowly, faintly, something comes up through the charcoal.', next: 'names' },
      names: {
        speaker: 'narrator', text: 'It is not a hero’s saga. It is a ring of names, hundreds of them, and over them one line: “These drove the herds to the Turning, and came home.”',
        choices: [
          { text: '(Read the names aloud.)', to: 'read', effects: [{ setFlag: 'skald.drove_rubbing', value: true }, { unlockLore: 'lore:hc-skald-drove-stone' }] },
          { text: '(Drum them, so the Fells hear them too.)', to: 'drum', school: 'song', effects: [{ setFlag: 'skald.drove_rubbing', value: true }, { unlockLore: 'lore:hc-skald-drove-stone' }] },
        ],
      },
      read: { speaker: 'narrator', text: 'You read them all, every one, while Asta holds the paper flat against the wind. Halfway down she says, “That’s my granny’s granny,” very quietly, and does not say anything else.', next: null },
      drum: { speaker: 'narrator', text: 'You drum each name, one beat apiece, and the Fells give every one of them back twice. Asta says she has never heard the Fells sound so pleased with themselves.', next: null },
      plain: { speaker: 'narrator', text: 'The drove stone by the old track, smooth again.', next: null },
    },
  },

  // ======================= Side: Egg-Song (the tenth egg)
  {
    id: 'dialogue:obj-skald-silent-egg', name: 'Egg-Song: the tenth egg', scope: 'party',
    entries: [{ when: stage('quest:skald-egg-song', 'tenth'), node: 'ledge' }, { node: 'plain' }],
    nodes: {
      ledge: {
        speaker: 'narrator', text: 'On a high ledge you set down the tenth egg, the cold one that hums nothing. On the next ledge along, the others are humming their mothers’ lullabies. This one is as quiet as a stone.',
        choices: [
          { text: '(Sing it a lullaby yourself. Any lullaby.)', to: 'sing', school: 'song', effects: [{ setFlag: 'skald.silent_egg', value: 'sung' }] },
          { text: '(Set it beside the others, and hope.)', to: 'leave', effects: [{ setFlag: 'skald.silent_egg', value: 'left' }] },
          { text: '(Drum it the slow beat Ragna used to drum you to sleep with.)', to: 'drum', effects: [{ setFlag: 'skald.silent_egg', value: 'drummed' }] },
        ],
      },
      sing: { speaker: 'narrator', text: 'You sing it the only lullaby you know all the way through. Halfway, the egg begins to hum along a beat behind, getting it slightly wrong, and then it hums the whole thing back to you.', next: null },
      leave: { speaker: 'narrator', text: 'You set it beside the others. After a long while, very faintly, it picks up a note from the nearest egg and holds it, as if it were trying it on.', next: null },
      drum: { speaker: 'narrator', text: 'You drum it Ragna’s slow beat, the one that put you to sleep in a drum-case on the Saga Hall steps. The egg does not hum. It thumps, once, gently, in time.', next: null },
      plain: { speaker: 'narrator', text: 'A high ledge on the Harpy Cliffs. Something on it is humming slightly wrong.', next: null },
    },
  },

  // ======================= Side: the Fog-Drummer (the night fog)
  {
    id: 'dialogue:obj-skald-fog-drum', name: 'The Fog-Drummer: drumming in the fog', scope: 'party',
    entries: [
      { when: { all: [stage('quest:skald-the-fog-drummer', 'fog'), NIGHT] }, node: 'night' },
      { when: stage('quest:skald-the-fog-drummer', 'fog'), node: 'day' },
      { node: 'plain' },
    ],
    nodes: {
      day: { speaker: 'narrator', text: 'The sea is clear today. Haldor says the fog is due after dark.', next: null },
      night: { speaker: 'narrator', text: 'After dark the fog comes in off the sea as thick as wool. You strike the new skin. The boom goes out into the grey and does not come back, which is how you know it has reached something.', next: 'ship' },
      ship: {
        speaker: 'narrator', text: 'Out in the fog, very faint, a ship’s bell answers: one, two, three. Haldor counts it on his fingers and grins. “That’s the Saltlark. She’ll come in on that. Stop now, or drum her the coast-saga all the way in.”',
        choices: [
          { text: '(Drum her in, rock by rock.)', to: 'in', effects: [{ setFlag: 'skald.fog_drummed', value: 'saga' }] },
          { text: '(Stop, and listen to her bell come closer.)', to: 'stop', effects: [{ setFlag: 'skald.fog_drummed', value: 'bell' }] },
        ],
      },
      in: { speaker: 'narrator', text: 'You drum the coast-saga, rock by rock, and the bell comes closer with every verse, until the Saltlark’s lantern swims up out of the fog and you can hear her crew cheering.', next: null },
      stop: { speaker: 'narrator', text: 'The bell comes closer by itself, following the last beat you gave it, until the Saltlark’s lantern swims up out of the fog. Haldor says that will do. Haldor says that will do very nicely.', next: null },
      plain: { speaker: 'narrator', text: 'The fog-drum on the cliff, its new skin drum-tight.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in the Fells’ ruin, cave and viewpoint
  {
    id: 'dialogue:obj-song-frontier-ruin-find', name: 'Fells ruin: the last relay', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A drum-tower burned to its stones on a bare fell, and among the ashes a war-drum split in two, its rim cut with the last message it ever carried: “THE GATE IS SHUT. TELL THE FELLS. TELL EVERYONE.” C. 1012.', effects: [{ unlockLore: 'lore:hc-song-frontier-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-song-frontier-cave-find', name: 'Fells cave: the answering voices', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'Speak in this cave and it answers in other people’s voices, old ones: a woman beginning a saga, a man laughing, a child counting sheep. Every one of them stops halfway, as if they had been interrupted a very long time ago.', effects: [{ unlockLore: 'lore:hc-song-frontier-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-song-frontier-cave-codex', name: 'The Answering Cave: a boy’s practice wall', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'Low on the wall at the back of the cave, tapped into the soft stone with a knuckle, are rows and rows of drum-marks: a child’s practice, nine hundred little groups of beats. At the end, scratched with a pebble: ALL OF THEM. U.', effects: [{ unlockLore: 'lore:hc-song-frontier-practice' }], next: null } },
  },
  {
    id: 'dialogue:obj-song-frontier-view-find', name: 'Fells viewpoint: the Long Look', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'From the top of the highest fell you can see every Drum-Stead at once, each one a thread of smoke, and the Saga Stones like a ring of teeth, and far to the south the Lyre Gate. On the summit cairn every stead’s name is cut in a ring, with an arrow pointing south.', effects: [{ unlockLore: 'lore:hc-song-frontier-view' }], next: null } },
  },

  // ======================= ACT II, C-1 The Drummers at the Fish Mill: the loft
  {
    id: 'dialogue:obj-skald-mill-loft', name: 'C-1 drumming in the Fish Mill loft', scope: 'party',
    entries: [{ when: stage('quest:skald-abbeyshore', 'loft'), node: 'loft' }, { node: 'plain' }],
    nodes: {
      loft: { speaker: 'narrator', text: 'The Fish Mill loft hangs over the wheel and smells of herring and wet rope. Nine Fells drummers sit in a ring on upturned creels: Hallgerd, two brothers called Ketil and Sweyn who have not agreed on a tempo since C. 1012, and six others who gave up trying.', next: 'pegs' },
      pegs: { speaker: 'narrator', text: 'Round the walls are forty pegs, one for each brother of the drowned choir, each tied with a strip of cloth with a name on it. Thirty-seven strips. Three pegs bare. Hallgerd points her stick at a spare drum: if you’re sitting, you’re drumming.', next: 'drum' },
      drum: {
        speaker: 'narrator', text: 'You drum with them, name after name, in the long-message beat, with the little hitch the Fells put before a name. Brother Hew. Brother Piran. Brother Tamlin. At each bare peg the ring keeps the beat and says nothing.',
        choices: [
          { text: '(Keep the silences with them.)', to: 'keep' },
          { text: '(Drum on through the bare pegs, as if the names were there.)', to: 'through' },
          { text: '(Settle Ketil and Sweyn’s tempo with a counter-beat.)', to: 'tempo', school: 'song' },
        ],
      },
      keep: { speaker: HG, text: 'Good. You don’t fill a gap you can’t fill. You leave it the right size, so the name fits when it comes home.', next: 'end' },
      through: { speaker: HG, mood: 'sad', text: '(Her stick comes down on your drum-rim, not hard.) No. That’s how we lost them, drumming past. You leave the gap the right size, so the name fits when it comes home.', next: 'end' },
      tempo: { speaker: 'narrator', mood: 'happy', text: 'You drum a steady beat between the two brothers until, for one whole name, Ketil and Sweyn are in time. They stare at each other in horror. Hallgerd laughs so hard she drops her stick.', next: 'end' },
      end: { speaker: HG, text: 'Thirty-seven, every night, for thirty years. The lake gives back wood, mostly. Go and look along the shore for our three, and you can tie them on these pegs yourself.', effects: [{ unlockLore: 'lore:hc-skald-mill-pegs' }], next: null },
      plain: { speaker: 'narrator', text: 'The Fish Mill loft. Forty pegs round the walls, and a spare drum on a creel.', next: null },
    },
  },

  // ======================= ACT II, C-3 Abbess Morwen: telling Hallgerd
  {
    id: 'dialogue:skald-hallgerd-morwen', name: 'C-3 Hallgerd hears the Abbess has all forty', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: HG, text: '(For the first time since you met her, Hallgerd is not drumming. Her stick lies across her knees.) We missed a beat. All nine of us at once, on Brother Ninian. Never done that. What happened down there, Fells?', next: 'tell' },
      tell: {
        speaker: HG, mood: 'sad', text: '(You tell her: the Abbess, the rope, the stalls, and the three names said back to you through the water.) She said them after you. Ninian, and Corrie, and the little one.',
        choices: [
          { text: '(Give her the three names for the bare pegs.)', to: 'pegs', trust: 1 },
          { text: 'She said all forty, Hallgerd. She heard you every night.', to: 'heard' },
        ],
      },
      pegs: { speaker: 'narrator', text: 'She ties the strips on herself, one by one, with fingers that have tied net-knots for sixty years and are shaking now. BR. NINIAN. CORRIE HARROWBY. TOD. Forty pegs, forty names. The loft goes very quiet.', next: 'now' },
      heard: { speaker: HG, text: 'Every night. (She looks at her drum as if it had said something.) Thirty years of shouting across a lake, and somebody was listening. That’s all a drummer ever wants, you know. That, and dry skins.', next: 'now' },
      now: {
        speaker: HG, text: 'So. The choir’s at rest and the names are home. (Ketil and Sweyn look at her.) Do we stop, then? Thirty years. I don’t know how not to.',
        choices: [
          { text: 'Keep drumming them. A name nobody says is a name that’s gone.', to: 'keep', effects: [{ setFlag: 'skald.mill_names', value: 'keep' }] },
          { text: 'Rest. They have. You can.', to: 'rest', effects: [{ setFlag: 'skald.mill_names', value: 'rest' }] },
        ],
      },
      keep: { speaker: HG, mood: 'happy', text: 'Fells law. Ha. Once a year, then, on the night the lake came up, all forty, loud. The rest of the year we’ll drum something with a tune in it. Ketil, Sweyn: you are going to have to agree on a tempo.', next: 'end' },
      rest: { speaker: HG, text: '(She hangs her stick on the fortieth peg, very carefully.) Rest. Well. If you hear drumming from the mill some nights all the same, that’s only old women who can’t sleep.', next: 'end' },
      end: { speaker: HG, text: 'Go on. There’s word from Hollis Lodge: the hounds are howling at a drum in the Gloamwood that nobody can find. A big slow beat, they say, like somebody asking. I’d know that beat anywhere. So would you.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Drum in the Glade: Ebba and her hounds to the treeline
  {
    id: 'dialogue:area-skald-gloam-path', name: 'C-4 banter: into the Gloamwood with Ebba', bark: true,
    entries: [{ when: { any: [stage('quest:skald-the-drum-in-the-glade', 'escort'), stage('quest:skald-the-drum-in-the-glade', 'regroup')] }, node: 'b' }],
    nodes: { b: { speaker: EB, text: 'Heel. Heel, the pair of you. (The coupled hounds strain towards the deep wood, whining.) Dusk’s an hour off and they can hear it already.', next: null } },
  },
  {
    id: 'dialogue:skald-ebba-hound', name: 'C-4 Ebba finds her hound at the treeline', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: EB, mood: 'happy', text: 'Grimble! You great daft lump! (A hound lies across the path at the treeline, unhurt, thumping her tail. She does not get up; she is lying on something.) She’s guarding. Look at her. She thinks she’s on duty.', next: 'collar' },
      collar: {
        speaker: 'narrator', text: 'Round Grimble’s neck is a collar of drum-hide, neatly stitched, and under her chin a parcel of bread and dried mutton in a dock leaf, untouched. Knotted into the collar in Ulf’s hand-knots: Yours? Good dog. Would not go home. Fed her.',
        choices: [
          { text: 'That’s Ulf. He always fed strays.', to: 'strays' },
          { text: 'He kept her safe for you.', to: 'safe', trust: 1, trustNpc: EB },
          { text: '(Read the rest of the knots: there are more, further round.)', to: 'more', school: 'song' },
        ],
      },
      strays: { speaker: EB, text: 'A man walking to the King, stopping to feed a hound and sew her a collar. (She rubs Grimble’s ears.) Hollow things don’t do that. Whatever he’s turning into, he hasn’t finished.', next: 'glade' },
      safe: { speaker: EB, mood: 'sad', text: 'He did. Wolves all over this wood, and not a mark on her. (She rubs Grimble’s ears.) Hollow things don’t sew collars. Whatever he’s turning into, he hasn’t finished.', next: 'glade' },
      more: { speaker: 'narrator', text: 'Further round the collar, smaller: Little one is coming. Tell them. Don’t let them follow. U. He knew you would come, and he left it on the dog anyway.', effects: [{ setFlag: 'skald.grimble_knots', value: true }], next: 'glade' },
      glade: { speaker: EB, text: 'The hounds go no further; I’ve tried. The glade’s down there, through the birches. (Grimble stands at last, looks down the path and whines.) Go on. I’ll take this one home and give her a bath she won’t forgive.', next: null },
    },
  },

  // ======================= ACT II, C-5 The White Stag: Ulf’s camp in the Deep Glade
  {
    id: 'dialogue:obj-skald-ulf-camp', name: 'C-5 Ulf’s camp in the Deep Glade', scope: 'party',
    entries: [{ when: stage('quest:skald-the-white-stag', 'camp'), node: 'hollow' }, { node: 'plain' }],
    nodes: {
      hollow: { speaker: 'narrator', text: 'A hollow under the oldest roots of the Deep Glade, dry and swept. A cold fire-ring. A bed of bracken pressed into the shape of a big man, and beside it, pressed into the moss, the shape of something much larger that lay down next to him every night.', next: 'road' },
      road: { speaker: 'narrator', text: 'Hung on a root, a long strip of drum-hide knotted from end to end: the Turning Road from the Gloamwood to the Heart, every stage of the old procession, in Ulf’s hand-knots, with a tally of nights beside each. The last knot is the Citadel door.', effects: [{ unlockLore: 'lore:hc-skald-ulf-road' }], next: 'bark' },
      bark: {
        speaker: 'narrator', text: 'Under the bracken, a square of birch-bark, carved and scraped smooth and carved again a dozen times. Every time the same first word: ULF. Every time, nothing after it. He was trying to begin his own saga, and could not decide how.',
        choices: [
          { text: '(Take the road-strip, and leave the bark.)', to: 'strip', effects: [{ setFlag: 'skald.ulf_camp', value: 'road' }] },
          { text: '(Take the bark. Somebody should finish it.)', to: 'keep', effects: [{ setFlag: 'skald.ulf_camp', value: 'bark' }] },
          { text: '(Knot an answer onto the end of the road-strip, and leave it hanging.)', to: 'knot', school: 'song', effects: [{ setFlag: 'skald.ulf_camp', value: 'knot' }] },
        ],
      },
      strip: { speaker: 'narrator', text: 'The strip is still warm from the root. He knew the way before the Stag did, you realise. He did not need it to lead him. He wanted something to walk beside.', next: null },
      keep: { speaker: 'narrator', mood: 'sad', text: 'You put the bark in your coat. ULF, and then nothing. On the Fells there is a stone that has been waiting for the rest of it since before you were born.', next: null },
      knot: { speaker: 'narrator', text: 'Under the Citadel door you knot: Little one is coming too. Not to follow. To walk beside. If he ever comes back this way, he will read it with his thumbs in the dark.', next: null },
      plain: { speaker: 'narrator', text: 'A swept hollow under the roots of the Deep Glade, with a cold fire-ring in it.', next: null },
    },
  },

  // ======================= ACT II, C-6 Ragna’s Drum-Letter: the answer
  {
    id: 'dialogue:obj-skald-arch-reply', name: 'C-6 drumming Ragna an answer', scope: 'party',
    entries: [{ when: stage('quest:skald-ragnas-drum-letter', 'reply'), node: 'drum' }, { node: 'plain' }],
    nodes: {
      drum: { speaker: 'narrator', text: 'Beyond the Song arch Ragna is still drumming, slower now, with gaps: her waiting-beat, the one she used at the Saga Hall door when you were late for supper. Pip has moved his slate to your side of the arch, ready.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'You set your drum against the lilac stone. What goes home over the Fells?',
        choices: [
          { text: '(Drum: The forty names are home. The choir is resting. I am well.)', to: 'sent', effects: [{ setFlag: 'skald.reply', value: 'names' }] },
          { text: '(Drum: I found Ulf’s camp. He fed a stray. He has not finished turning.)', to: 'sent', when: { flag: 'skald.ulf_camp' }, effects: [{ setFlag: 'skald.reply', value: 'ulf' }] },
          { text: '(Drum Pip’s name, with the hitch before it, so the Fells will know it.)', to: 'pip', when: { flag: 'skald.pip_saga' }, effects: [{ setFlag: 'skald.reply', value: 'pip' }] },
          { text: '(Drum her a verse of a saga nobody has drummed: Ragna, who kept the small ones.)', to: 'sent', school: 'song', effects: [{ setFlag: 'skald.reply', value: 'ragna' }] },
        ],
      },
      pip: { speaker: 'narrator', mood: 'happy', text: 'Pip watches your hands, and then his own name goes over the arch and away, PIP, with a hitch before it like anybody’s. He does not say anything for a long time, which for Pip is a record.', next: 'sent' },
      sent: { speaker: 'narrator', text: 'The drum on the far side stops. Then it starts again, quick, the beat every child on the Fells knows: Heard. Heard. Heard. Farther off a second drum takes it up, and a third, valley to valley, all the way home.', next: null },
      plain: { speaker: 'narrator', text: 'The Song arch, which answers your footsteps a beat late.', next: null },
    },
  },

  // ======================= ACT III: the last relay post (The Nine-Hundred-and-First; A Stone for Ulf)
  {
    id: 'dialogue:obj-skald-relay-post', name: 'Act III: Hallgerd at the last relay post', scope: 'party',
    entries: [
      { when: stage('quest:skald-the-nine-hundred-and-first', 'post'), node: 'post' },
      { when: stage('quest:skald-a-stone-for-ulf', 'relay'), node: 'ulf' },
      { node: 'plain' },
    ],
    nodes: {
      post: { speaker: 'narrator', text: 'Where the Heart camp meets the old road stands a drum on a post, and behind it, on a three-legged stool, wrapped in four shawls, sits Hallgerd Drum-Wife, who has come all the way from Abbeyshore to be the last link in the relay.', next: 'loud' },
      loud: { speaker: HG, mood: 'happy', text: 'Don’t look like that. Nine of us, three miles apart, from the Song arch to here, and I took the end because I’m the loudest. Ketil and Sweyn are posted together. Nobody else would have them.', next: 'hands' },
      hands: {
        speaker: HG, text: '(She lowers her voice, which for Hallgerd is still loud.) Something you ought to know before you drum. The letters since the thaw aren’t Ragna’s hands. Too steady. The hitch before the names is hers, but somebody’s copying it.',
        choices: [
          { text: 'Who?', to: 'who' },
          { text: 'Ragna’s hands shake now. She’s old.', to: 'old' },
        ],
      },
      old: { speaker: HG, mood: 'sad', text: 'Older than me, and I’m older than the mill. So somebody drums for her, and does her hitch so she won’t mind.', next: 'who' },
      who: {
        speaker: HG, text: 'A child, by the weight of it. Light hands, quick, and a stumble on every eleventh beat, like somebody counting under their breath. Ten years old, I’d say.',
        choices: [
          { text: 'Asta. The girl who takes the rubbings.', to: 'asta', effects: [{ setFlag: 'skald.asta_relay', value: true }] },
          { text: '(Say nothing, and listen to the drum on the post.)', to: 'listen', effects: [{ setFlag: 'skald.asta_relay', value: true }] },
        ],
      },
      listen: { speaker: 'narrator', text: 'Faint on the post, the far end of the relay is still drumming: light and quick, a stumble on every eleventh beat, and Ragna’s hitch before every name. Somebody on the Fells is learning.', next: 'asta' },
      asta: { speaker: HG, text: 'Then that’s your saga’s real road. Ragna wants to learn it by ear, and so does whoever is drumming for her. Drum it slow enough for both.', next: 'go' },
      go: { speaker: HG, text: 'Up the stair with you. I’ll take it the first mile. And if it’s long, drum it twice. The Fells only believe what they hear twice.', next: null },
      ulf: { speaker: 'narrator', text: 'Where the Heart camp meets the old road, Hallgerd Drum-Wife sits at the relay post in four shawls. You tell her what you cut on the stair-stone, line by line, and she drums each line back to check it, nodding, until she comes to the name.', next: 'stop' },
      stop: {
        speaker: HG, text: '(Her sticks stop.) I can’t send that. Not won’t: can’t. The relay drums every name in its own name-beat, the one a child gets at its first singing in the Saga Hall. What’s his?',
        choices: [
          { text: 'He never had one. He never sang.', to: 'none' },
          { text: 'Drum it letter by letter, then.', to: 'letters' },
        ],
      },
      letters: { speaker: HG, text: 'Letter by letter is how the relay drums a stranger, or a ship. Is that what he was, on the Fells? A ship going past?', next: 'none' },
      none: { speaker: HG, mood: 'sad', text: 'So on the relay he’s been “the drummer” all his life. Thirty years I’ve drummed names for drowned monks, and the Fells never gave one of their own a beat.', next: 'make' },
      make: { speaker: HG, text: 'Then make him one. Not here: on something big enough to carry it. The Legion’s great drum, that the King’s summons went out on. Let it drum one thing worth hearing. I’ll be listening for it.', effects: [{ setFlag: 'skald.ulf_relay', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'A drum on a post where the Heart camp meets the old road. A stool behind it, with a shawl left on it to keep the place.', next: null },
    },
  },

  // ======================= ACT III, The Hollow Skalds: the muster-board, the cask
  {
    id: 'dialogue:obj-skald-legion-muster', name: 'The Hollow Skalds: the Legion’s muster-board', scope: 'party',
    entries: [{ when: stage('quest:skald-the-hollow-skalds', 'roll'), node: 'board' }, { node: 'plain' }],
    nodes: {
      board: { speaker: 'narrator', text: 'The Legion’s muster-board is a slab of slate as long as a cart, chalked from end to end in a square grey hand. No names. Only what each one was: drummer, drummer, cook, shepherd, drummer, nobody, nobody, nobody.', next: 'three' },
      three: {
        speaker: 'narrator', mood: 'sad', text: 'Gisla finds their three marks with her drumstick: drummer, drummer, drummer, side by side. Orm looks at all the nobodies for a long time. Bersi drums, very quietly: That is how he counted us.',
        choices: [
          { text: '(Wipe their three marks off with your sleeve.)', to: 'wipe', effects: [{ setFlag: 'skald.muster', value: 'wiped' }] },
          { text: '(Chalk their names over the marks: GISLA WEATHERDRUM. ORM TARNWATER. BERSI.)', to: 'names', effects: [{ setFlag: 'skald.muster', value: 'named' }] },
          { text: '(Chalk a Fells name over every mark you can reach, until the chalk runs out.)', to: 'all', school: 'song', effects: [{ setFlag: 'skald.muster', value: 'all' }] },
        ],
      },
      wipe: { speaker: 'narrator', text: 'Three clean patches on the slate. Bersi nods: a Skald owes no muster now. He looks at the board a moment longer, and then wipes one more “nobody” off it himself, for luck.', next: 'end' },
      names: { speaker: 'narrator', text: 'You chalk them in, in big Fells capitals. Orm reads his own name three times, moving his lips. Nobody, Gisla drums, has ever written it down before. They only ever drummed it.', next: 'end' },
      all: { speaker: 'narrator', text: 'You chalk names until the stick is a stub: Hrolf, Signe, Old Tova, Bjarni, every Fells name you know. None of them are right. All of them are better. A Legion sentry watches you, and does not stop you.', next: 'end' },
      end: { speaker: 'narrator', text: 'Bersi slings his drum round onto his back. Then he drums at you, quite firmly, one more thing: Drink. Somebody owes everyone one. He is looking at the supply carts at the Heart camp.', next: null },
      plain: { speaker: 'narrator', text: 'The Legion’s muster-board, chalked from end to end. Here and there a mark has been wiped clean.', next: null },
    },
  },
  {
    id: 'dialogue:obj-skald-camp-cask', name: 'The Hollow Skalds: a round at the Heart camp', scope: 'party',
    entries: [{ when: stage('quest:skald-the-hollow-skalds', 'cask'), node: 'cask' }, { node: 'plain' }],
    nodes: {
      cask: { speaker: 'narrator', text: 'On the supply cart at the Heart camp stands a cask of something brown that the quartermaster calls ale out of politeness. Gisla, Orm and Bersi sit down on the tail of the cart like drummers who have waited thirty years for a round.', next: 'toast' },
      toast: {
        speaker: 'narrator', text: 'You pour four. Bersi drums the toast-beat on the cart, loud, the one he taught you when you were six, and half the camp turns round again.',
        choices: [
          { text: '(Drink to the Fells.)', to: 'fells' },
          { text: '(Drink to Ulf.)', to: 'ulf' },
          { text: '(Drum the toast back to him the way you did at six, mistake and all.)', to: 'six', school: 'song' },
        ],
      },
      fells: { speaker: 'narrator', mood: 'happy', text: 'To the Fells. Three cups go up. Gisla drums afterwards: Rain by noon. It is still not going to rain. Nobody minds.', next: 'go' },
      ulf: { speaker: 'narrator', mood: 'sad', text: 'To Ulf. The three of them go still. Then Bersi lifts his cup, and Orm, and Gisla, and they drum his name together, letter by letter, the way the Fells drum a stranger’s.', next: 'go' },
      six: { speaker: 'narrator', mood: 'happy', text: 'You drum it back with the extra beat in the third bar, the way you did at six. Bersi throws his head back and laughs without a sound, and drums: Still wrong. Still wrong. Good.', next: 'go' },
      go: { speaker: 'narrator', text: 'They finish the round, and the next, which Orm pays for with a button. At dawn three pairs of bootprints go north from the cart, and on the tailboard is a drummer’s dent, the way Skalds sign the bar at the Gilded Goose.', effects: [{ setFlag: 'skald.skalds_home', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The tail of a supply cart at the Heart camp, with a drummer’s dent in it.', next: null },
    },
  },

  // ======================= ACT III, A Stone for Ulf: the name-beat on the Legion’s great drum
  {
    id: 'dialogue:obj-skald-legion-drum', name: 'A Stone for Ulf: the Legion’s great drum', scope: 'party',
    entries: [{ when: stage('quest:skald-a-stone-for-ulf', 'beat'), node: 'drum' }, { node: 'plain' }],
    nodes: {
      drum: { speaker: 'narrator', text: 'In the middle of the Legion camp stands the great drum the King’s summons went out on, black-skinned and taller than a man. Nobody has touched it since the Legion stopped. The hollowed nearest it turn their heads when you lift the sticks.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'A name-beat is short, and it has to sound like the person. What is Ulf’s?',
        choices: [
          { text: '(Three slow beats and a hitch: the way he climbed the Saga Hall steps, careful of the drum on his back.)', to: 'beat', effects: [{ setFlag: 'skald.ulf_beat', value: 'steps' }] },
          { text: '(The first bar of the toast-beat, which he drummed at every wedding he was never asked to sing at.)', to: 'beat', effects: [{ setFlag: 'skald.ulf_beat', value: 'toast' }] },
          { text: '(Nine beats, one for each year of a boy drumming alone on Scarrow Pike.)', to: 'beat', when: { flag: 'skald.ninehundredth' }, effects: [{ setFlag: 'skald.ulf_beat', value: 'pike' }] },
          { text: '(One beat, and then a rest the length of a breath, where a voice would come in if it could.)', to: 'beat', school: 'song', effects: [{ setFlag: 'skald.ulf_beat', value: 'rest' }] },
        ],
      },
      beat: { speaker: 'narrator', text: 'You drum it on the King’s drum three times, the Fells way, and the Heart throws it back three times. Then from the camp’s edge Hallgerd’s drum takes it up, and the next post, and the next: a name going north towards a stone that has waited for it.', next: 'end' },
      end: { speaker: 'narrator', mood: 'sad', text: 'The hollowed round the great drum are still listening. One of them, very slowly, taps the beat on his own breastplate, as if trying out what it would be like to have one.', effects: [{ setFlag: 'skald.ulf_namebeat', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Legion’s great drum. Someone has scratched a short beat into the rim, with a hitch after it.', next: null },
    },
  },
];

export default dialogues;
