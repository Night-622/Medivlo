/**
 * Hollow Crown, shared Act II depth pass (10-campaign-style.md §8, docs/PACING.md): the new Concordia stages’
 * scenes, beats and banter. Every class plays these, so lines use campaign tokens ({class}, {mentor}…). Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const MA = 'npc:maren' as const, GO = 'npc:godric' as const, AL = 'npc:aldous' as const, WI = 'npc:wil' as const;

/** a beat object: one scene while its stage runs (sets its flag), a plain line otherwise */
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
  // ======================= II-1 Through the Arch: the moor road, the Elder
  {
    id: 'dialogue:area-cc-moor-road', name: 'II-1 banter: the moor road', bark: true,
    entries: [{ when: stage('quest:cc-through-the-arch', 'road'), node: 'b' }],
    nodes: { b: { speaker: MA, text: 'Keep to the stones. The moor eats boots. Brindlecross is over the rise: smoke, a chapel, an inn. You’ll smell the stew before you see it.', next: null } },
  },
  {
    id: 'dialogue:cc-maren-road', name: 'II-1 Maren on the road', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: MA, text: 'Walk, {class}. Talk later. The Elder will want to see you before anyone else does, and so will everyone else.', next: null } },
  },
  {
    id: 'dialogue:cc-godric-welcome', name: 'II-1 Elder Godric’s welcome', scope: 'party',
    entries: [{ node: 'door' }],
    nodes: {
      door: { speaker: 'narrator', text: 'The Elder’s house is the oldest in Brindlecross: thick walls, a low door, a fire that has clearly been lit for a long time. Elder Godric is sitting very upright by it, as if on duty.', next: 'look' },
      look: { speaker: GO, text: 'So. Maren says an arch lit, and somebody walked out of it. Let me look at you. (He does, for a long time, the way a sentry looks at a stranger.) Thirty years those arches have been dark.', next: 'ask' },
      ask: {
        speaker: GO, text: 'You will have questions. Everybody who comes through has questions. I have only some of the answers, and I give out fewer than I have.',
        choices: [
          { text: 'Where am I?', to: 'where' },
          { text: 'Why are the arches weeping?', to: 'weeping' },
          { text: 'You say that like a man who’s kept a door.', to: 'door2', insight: 'godric_guard' },
        ],
      },
      where: { speaker: GO, text: 'Morvane. Concordia, if you are being grand about it: the land between the realms, where the twelve schools used to meet. Brindlecross is its oldest village. Mostly sheep now. Some trouble.', next: 'trouble' },
      weeping: { speaker: GO, mood: 'sad', text: 'The same reason everything weeps here. Something at the Heart of Morvane has been crying for thirty years, and the crying gets into the stone. You will see the Wall, in time. Everybody does.', next: 'trouble' },
      door2: { speaker: GO, text: '(A pause, long enough to be an answer.) I kept a door once. I was not much good at it. Ask me another time, when I have had more to drink.', next: 'trouble' },
      trouble: {
        speaker: GO, text: 'Here is the trouble, {class}. The wolves are walking into the fire instead of away from it. The Abbey bells rang under the lake the night you came. And every few days now, someone else turns up with a stone singing in their chest.',
        choices: [
          { text: 'Others like me?', to: 'others' },
          { text: 'What do you want me to do?', to: 'do' },
        ],
      },
      others: { speaker: GO, text: 'From other schools, through other arches. You will meet them. Some of you will not get on. All of you will need each other. Bearers always have.', next: 'do' },
      do: { speaker: GO, text: 'Tonight, eat. Wil Crane at the Gilded Goose has a bed for you. Tomorrow, help Maren with the wolves, and then come back to me. There is something under the lake I would like you to look at.', next: null },
    },
  },

  // ======================= II-2 The Wolves at the Gate: deeper into the Gloamwood
  beat('cc-stag-print-1', 'II-2 the stag prints (1)', stage('quest:cc-wolves', 'deeper'),
    'Deeper in, the wolf tracks stop circling. A wolf lay down here, on its side, beside the stag’s prints, quite calmly, the way a dog lies down at its master’s feet. The black on the hoofprints is still wet.',
    'cc.stag_print_1', 'Flattened bracken, where something lay down.'),
  beat('cc-stag-print-2', 'II-2 the stag prints (2)', stage('quest:cc-wolves', 'deeper'),
    'A black pool in a hollow, where the Stag stood a long time, weeping. All round it, at the edge of the trees, the ground is worn in a ring by wolf feet. They were not hunting it. They were guarding it.',
    'cc.stag_print_2', 'A dried black hollow, ringed by trodden earth.', 'Whatever is driving the wolves, it is the Stag’s grief that keeps them near. Nan Briar will want to hear this.'),

  // ======================= II-3 The Drowned Bell: the register, Aldous after the lake
  beat('cc-abbey-register', 'II-3 the Abbey register', stage('quest:cc-drowned-bell', 'register'),
    'The Abbey register, saved from the flood, kept in the chapel under a cloth. The last entry is in a shaking hand: “Night of the lake. The water is at the north door. The Abbess holds the rope. She says: not out of turn. We are singing.” Under it, forty names. The choir.',
    'cc.register_read', 'The Abbey register, under its cloth.', 'Beside one name, Aldous, someone has written later, small: “Swam out. God forgive him for living.” The handwriting is his.'),
  {
    id: 'dialogue:cc-aldous-after', name: 'II-3 Aldous after the lake', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: AL, text: 'You went out on the lake. I can see it on you. Everyone who rows out over the tower comes back looking like that. Did she… did you see her?', next: 'saw' },
      saw: {
        speaker: AL, mood: 'sad', text: '(You tell him about the face under the water, and the words.) “Not out of turn.” That is what she said that night too. The water was over the altar and she would not let us ring it, not even to call for help.',
        choices: [
          { text: 'You read the register. You wrote beside your own name.', to: 'name', when: { flag: 'cc.register_read' } },
          { text: 'Why wouldn’t she ring it?', to: 'why' },
        ],
      },
      name: { speaker: AL, mood: 'sad', text: '“God forgive him for living.” Yes. I wrote it the year after. I was nineteen and I could swim, and they could not, and I swam. They were singing when I went out of the window. They were still singing when I reached the shore.', next: 'why' },
      why: { speaker: AL, text: 'Because the Turning Bell rings once for every passing of the crown, and for nothing else. Ring it for a flood and it means nothing ever again. She held it for us. She is still holding it. Someone else rang it, the night you came.', next: 'end' },
      end: { speaker: AL, text: 'Elder Godric should hear what you saw. And then, I think, the bearers should start gathering. If the Bell is waking, something is coming due.', next: null },
    },
  },

  // ======================= II-4 Tears of the Stag: the Stag’s signs
  ...[
    'Bark rubbed raw on an oak at the height of a stag’s shoulder, as if something tall had leant there a long time. The raw wood is weeping black sap.',
    'A single white hair caught on a briar, long as your arm, stiff with dried tears. It is warm, the way a hand is warm.',
    'A ring of flowers in a clearing, every one of them black and dead, every one of them still standing upright, as if the Stag had stood in the middle and they had all turned to look.',
  ].map((text, i): DialogueDef => beat(`cc-stag-sign-${i + 1}`, `II-4 the Stag’s signs (${i + 1})`, stage('quest:cc-tears', 'signs'),
    text, `cc.stag_sign_${i + 1}`, 'The Gloamwood, quiet, and the Stag long gone.')),

  // ======================= II-5 The Stone Court: the charter
  beat('cc-court-charter', 'II-5 the Concord charter', stage('quest:cc-stone-court', 'charter'),
    'The charter is cut into the Stone Court’s north wall: twelve columns, one for each school, each with its oath and its mark. At the foot, a line in an older hand that runs under all twelve: “And the crown shall hold the grief of the schools, and be sung to, and passed on.”',
    'cc.charter_read', 'The Concord charter on the Stone Court wall.', 'There is a thirteenth column, at the very end. It has been chiselled flat, carefully, by someone who did not want it read. Only the mark at the top survives: a ring, with nothing in it.'),

  // ======================= II-6 The Eve of the Turning: farewells in Brindlecross
  {
    id: 'dialogue:cc-wil-eve', name: 'II-6 Wil on the Eve', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: WI, text: 'The Bell tonight, is it? Then you’ll be going to the Heart after. Nobody comes back from the Heart, they say. They also said nobody comes through the arches, and here you are, eating my stew.', next: 'song' },
      song: {
        speaker: WI, mood: 'happy', text: 'I’m keeping your room. I’m not giving it to anybody. And when you come back I want the whole of it, every word, so I can make a song of it. Promise.',
        choices: [
          { text: 'I promise.', to: 'promise', trust: 1 },
          { text: 'Make the song anyway, if I don’t.', to: 'anyway' },
          { text: 'Write one more letter. For whoever comes back from the Heart.', to: 'letter', when: { flag: 'cc.wil_letters' } },
        ],
      },
      promise: { speaker: WI, text: 'Good. That’s settled, then. Go on. I’ll leave a candle in the window. The Goose always leaves a candle.', next: null },
      letter: { speaker: WI, mood: 'happy', text: '(She laughs, and it catches halfway.) One more. “Welcome back. The stew is free tonight.” It’ll be in the drawer. Mind, the drawer sticks.', next: null },
      anyway: { speaker: WI, mood: 'sad', text: 'Don’t. Don’t say that in my inn. (She polishes a mug that is already clean.) There’s a candle in the window. There always will be.', next: null },
    },
  },
  {
    id: 'dialogue:cc-godric-eve', name: 'II-6 Godric on the Eve', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GO, text: 'So it is a Turning after all. Bearers, marks, the Bell. Ysolde has written it all down twice. I never thought I would live to see one again.', next: 'again' },
      again: {
        speaker: GO, mood: 'sad', text: '“Again.” Yes. I saw the last one. I was on the door of the Citadel the night it went wrong. I will tell you about it one day. Not tonight. Tonight you should only be thinking of the road.',
        choices: [
          { text: 'Tell me when I come back.', to: 'back', trust: 1 },
          { text: 'Whatever you saw, it isn’t your fault.', to: 'fault' },
        ],
      },
      back: { speaker: GO, text: 'When you come back. Yes. I will have a great deal to say, and a great deal to drink. Go down to the shore, {class}. Aldous is waiting with his boat.', next: null },
      fault: { speaker: GO, mood: 'sad', text: 'You are very kind. You do not know yet. Go down to the shore. Aldous is waiting with his boat.', next: null },
    },
  },

  // ======================= Sides: Hollow Iron, Something in the Reeds, Rebuild the Mill
  {
    id: 'dialogue:obj-cc-odo-anvil', name: 'Hollow Iron: forging it', scope: 'party',
    entries: [{ when: stage('quest:cc-hollow-iron', 'forge'), node: 'forge' }, { node: 'plain' }],
    nodes: {
      forge: { speaker: 'narrator', text: 'Odo heats the hollow iron and lays it on the anvil, and you hold the tongs while he strikes. The first blow rings wrong. The second rings wronger. On the third, the iron sings a single long note, very low, like someone humming to a child.', next: 'odo' },
      odo: {
        speaker: 'npc:odo', text: '(He stops, hammer raised.) Did you hear that? It remembers. Whatever this was before it was armour, it was something that sang. I can’t make a sword out of that.',
        choices: [
          { text: 'Then make it something else.', to: 'else', effects: [{ setFlag: 'cc.hollow_iron', value: 'bell' }] },
          { text: 'Make the sword. Iron is iron.', to: 'sword', effects: [{ setFlag: 'cc.hollow_iron', value: 'sword' }] },
        ],
      },
      else: { speaker: 'npc:odo', mood: 'happy', text: 'A bell. A little one. For the chapel, maybe, or the Goose’s door. Something that can go on singing. You’ve got a smith’s heart, you know.', next: null },
      sword: { speaker: 'npc:odo', text: 'Iron is iron. Aye. (He makes it. It is a good sword. Every time it is drawn, it hums, very quietly.)', next: null },
      plain: { speaker: 'narrator', text: 'Odo’s anvil, still warm.', next: null },
    },
  },
  {
    id: 'dialogue:cc-tamsin-reeds', name: 'Something in the Reeds: telling Tamsin', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:tamsin', text: 'You followed them? All the way down? What were they?', next: 'tell' },
      tell: {
        speaker: 'npc:tamsin', mood: 'sad', text: '(You tell her: pale shapes in choir robes, swimming downstream, slow, in rows, towards the drowned Abbey.) The choir. Going home every night, and every morning back up the river to wherever they wander. I’ve been ferrying over them for thirty years.',
        choices: [
          { text: 'They aren’t dangerous.', to: 'safe' },
          { text: 'They’re waiting for something.', to: 'waiting', insight: 'choir_waiting' },
        ],
      },
      safe: { speaker: 'npc:tamsin', text: 'No. Just sad. I’ll stop throwing stones at them, then. I feel terrible about the stones.', next: null },
      waiting: { speaker: 'npc:tamsin', text: 'For the Bell. Aldous says it rang. If it rings again, properly, I think they’ll stop swimming. I think they’ll be allowed to stop.', next: null },
    },
  },
  {
    id: 'dialogue:obj-cc-mill-wheel', name: 'Rebuild the Mill: raising the wheel', scope: 'party',
    entries: [{ when: stage('quest:cc-mill', 'wheel'), node: 'raise' }, { node: 'plain' }],
    nodes: {
      raise: { speaker: 'narrator', text: 'Half of Brindlecross turns out to raise the new wheel: Corwin on the ropes, Odo with a crowbar, Wil with a barrel of something, Pip in everyone’s way. On the count of three, the wheel goes up, and catches the water, and turns.', next: 'turn' },
      turn: { speaker: 'npc:corwin', mood: 'happy', text: 'It turns! It turns. (He sits down in the mud and laughs.) Thirty years of wolves and weeping and it turns. Bread on Saturday, everyone. Bread on Saturday.', effects: [{ setFlag: 'cc.mill_turning', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Corwin’s mill wheel, turning steadily.', next: null },
    },
  },
];

export default dialogues;
