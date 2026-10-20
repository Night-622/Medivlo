/** Hollow Crown, SKALD Act III: the nemesis remade, the mentor’s last request and the Heart side quests. Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const RG = 'npc:ragna-saga-keeper' as const, UL = 'npc:ulf-the-unsung' as const;
const STONES = (v: string): NarrativeCondition => ({ flag: 'skald.stones', op: '==', value: v });

/** a hollow Skald in the Legion camp, drummed their name */
const skald = (n: number, find: string, wake: string, plain: string): DialogueDef => ({
  id: `dialogue:obj-skald-hollow-skald-${n}`, name: `The Hollow Skalds: Skald ${n}`, scope: 'party',
  entries: [{ when: stage('quest:skald-the-hollow-skalds', 'names'), node: 'find' }, { node: 'plain' }],
  nodes: {
    find: { speaker: 'narrator', text: find, next: 'wake' },
    wake: { speaker: 'narrator', text: wake, next: null },
    plain: { speaker: 'narrator', text: plain, next: null },
  },
});

const SAGA = 'At the head of the Song stair stands an old Turning drum, its skin still good. You sit down at it and drum your saga: a baby in a drum-case on the Saga Hall steps, the harpies, the hall at Hoddersgill, the moot, the barrow, the gate, the long road, the Stairs.';

const dialogues: DialogueDef[] = [
  // ---------- III-4 The Unsung Chimera: Ulf's fate
  {
    id: 'dialogue:skald-herald-fate', name: 'III-4 the Unsung Chimera: Ulf’s fate', scope: 'party',
    entries: [
      { when: STONES('great'), node: 'kneel-great' },
      { when: STONES('unsung'), node: 'kneel-unsung' },
      { when: STONES('weather'), node: 'kneel-weather' },
      { node: 'kneel' },
    ],
    nodes: {
      kneel: { speaker: UL, mood: 'hollow', text: '(The war-drum in the Chimera’s chest beats once, and the Heart throws it back three times. Drum, in the old hand-beat: Beaten. Good. Little one. Listen to me.)', next: 'king' },
      'kneel-great': { speaker: UL, mood: 'hollow', text: '(The war-drum in the Chimera’s chest beats once, and the Heart throws it back three times. Drum: You cut the chiefs. The heroes. Not the cooks. Not my mother. Not me. I watched you choose.)', next: 'king' },
      'kneel-unsung': { speaker: UL, mood: 'hollow', text: '(The war-drum in the Chimera’s chest beats once, and the Heart throws it back three times. Drum: You cut my mother’s name. I ran. I could not bear it. Nobody had ever cut a name for the likes of us.)', next: 'king' },
      'kneel-weather': { speaker: UL, mood: 'hollow', text: '(The war-drum in the Chimera’s chest beats once, and the Heart throws it back three times. Drum: You let them all go blank. Then nobody has a saga. That is fair, at least. The first fair thing.)', next: 'king' },
      king: { speaker: UL, mood: 'sad', text: '(The great stitched head turns towards the Citadel doors. Drum: He is in there. Unsung, like me. Every school sang at him, and he heard nothing. The harpy never brought him my letter. I came anyway. He knew what I was without asking.)', next: 'choose' },
      choose: {
        speaker: UL, text: '(Drum, slow: Cut in tears, the sagas never wear. Nobody has to sing them, so nobody is left out. He wants that. I wanted that. So, little one. Do the unsung get a stone, or a voice?)',
        choices: [
          {
            text: '(Hold up your drum, and give him back his voice.)', to: 'spare', quest: true,
            when: { all: [{ flag: 'skald.ulf_voice', op: '==', value: 'caught' }, { any: [STONES('unsung'), { trust: RG, value: 'trusted' }] }] },
            lockedLabel: 'You need his voice in your drum, and the unsung cut or Ragna’s trust',
            effects: [{ setFlag: 'skald.nemesis_fate', value: 'spared' }],
          },
          { text: '(Drum him the last beat of his saga, and let it end.)', to: 'destroy', quest: true, effects: [{ setFlag: 'skald.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      spare: { speaker: 'narrator', text: 'You strike your drum once. The rough, plain voice you caught at the Lyre Gate goes out of it like a bird out of a coat, straight into the Chimera’s mouth. The war-drum in its chest splits. The black runs off its hide like rain, and on the stair is a broad man with a beard, coughing.', next: 'spare2' },
      spare2: { speaker: UL, mood: 'sad', text: '(Rough, quiet, badly out of tune.) Little one. (He listens to it.) That’s me. It doesn’t ring. It never rang. (He looks at the Citadel.) Tell him in there. It doesn’t have to ring. It only has to be his.', next: null },
      destroy: { speaker: UL, mood: 'sad', text: '(The war-drum in its chest, very softly, before you have lifted your hands: Thank you. Tell Ragna. I couldn’t.)', next: 'destroy2' },
      destroy2: { speaker: 'narrator', text: 'You drum him the last beat of his saga, the one nobody ever cut. The war-drum answers it once and splits, and the Heart throws the beat back three times, and then is quiet. When the black has run off the stair, there is only a drum with a broken skin.', next: null },
    },
  },
  // ---------- The Nine-Hundred-and-First (mentor's last request)
  {
    id: 'dialogue:obj-skald-camp-drum', name: 'The Nine-Hundred-and-First: Ragna’s drum-letter at the Heart camp', scope: 'party',
    entries: [{ when: stage('quest:skald-the-nine-hundred-and-first', 'relay'), node: 'listen' }, { node: 'plain' }],
    nodes: {
      listen: { speaker: 'narrator', text: 'By the Heart camp’s fire, a drum is humming on its stand. Far behind you, valley by valley across Morvane, somebody is relaying the Fells’ long-message beat, with a little hitch before every name. Pip is sitting with his ear to the skin and a slate on his knee.', next: 'pip' },
      pip: { speaker: 'npc:pip', mood: 'happy', text: 'It’s her again! Ragna! The drummers from the Fish Mill passed it all the way from the Song arch, and I wrote it down, same as last time. Only this one’s got a question in. I’m going to read it.', next: 'letter' },
      letter: {
        speaker: RG, text: '“Little one. I have nine hundred sagas and fewer every week. Before the rest go, I want one new one, and I want it to be yours. Drum it from the top of the Song stair. The relay will bring it home, and I will learn it the old way, by ear. R.”',
        choices: [
          { text: 'I’ll drum it from the top, Pip.', to: 'top', quest: true, effects: [{ setFlag: 'skald.ragna_relay', value: true }] },
          { text: 'You’re in it, Pip. I promised.', to: 'pip-in', quest: true, when: { flag: 'skald.pip_saga' }, effects: [{ setFlag: 'skald.ragna_relay', value: true }] },
        ],
      },
      top: { speaker: 'npc:pip', text: 'From the top. Loud, mind. It’s a long way to the Fells, and I want to hear it go.', next: null },
      'pip-in': { speaker: 'npc:pip', mood: 'happy', text: 'With my name? Spelled right? (He rubs out the slate and writes PIP on it, very large.) Then it’s a good saga already.', next: null },
      plain: { speaker: 'narrator', text: 'A drum on a stand by the Heart camp fire. Every so often it hums, as if something far away were drumming on it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-skald-saga-drum', name: 'The Nine-Hundred-and-First: the drum at the head of the Song stair', scope: 'party',
    entries: [
      { when: { all: [stage('quest:skald-the-nine-hundred-and-first', 'drum'), { flag: 'skald.ragna_devotable' }] }, node: 'drum-devoted' },
      { when: stage('quest:skald-the-nine-hundred-and-first', 'drum'), node: 'drum' },
      { node: 'plain' },
    ],
    nodes: {
      drum: {
        speaker: 'narrator', text: SAGA,
        choices: [
          { text: '(Drum it plainly, verse by verse, the way she taught you.)', to: 'home' },
          { text: '(Give Pip a verse: a squire with a wooden sword and a very good memory.)', to: 'home', when: { flag: 'skald.pip_saga' } },
          { text: '(Drum it slowly, slow enough for a girl of ten to learn.)', to: 'home-asta', when: { flag: 'skald.asta_relay' } },
          { text: '(Leave a rest at the end, where the next verse comes in.)', to: 'home', school: 'song' },
        ],
      },
      home: { speaker: 'narrator', text: 'The Heart throws it back three times, like the Fells, and then far away the relay picks it up and carries it home, valley to valley. The Nine-Hundred-and-First Saga. It is not finished. Sagas never are.', effects: [{ setFlag: 'skald.saga_drummed', value: true }], next: null },
      'home-asta': { speaker: 'narrator', text: 'The relay carries it home as slowly as you drummed it. Far away at Ragna’s hearth two drums answer: one old and shaking, and one light and quick that stumbles on every eleventh beat and does not lose a word.', effects: [{ setFlag: 'skald.saga_drummed', value: true }], next: null },
      'drum-devoted': {
        speaker: 'narrator', text: SAGA,
        choices: [
          { text: '(Drum it plainly, verse by verse, the way she taught you.)', to: 'home-devoted' },
          { text: '(Give Pip a verse: a squire with a wooden sword and a very good memory.)', to: 'home-devoted', when: { flag: 'skald.pip_saga' } },
          { text: '(Drum it slowly, slow enough for a girl of ten to learn.)', to: 'home-devoted', when: { flag: 'skald.asta_relay' } },
          { text: '(Leave a rest at the end, where the next verse comes in.)', to: 'home-devoted', school: 'song' },
        ],
      },
      'home-devoted': {
        speaker: 'narrator', mood: 'happy', text: 'The relay carries it home, valley to valley. Far away on the Fells, by her hearth, an old woman with one slipper on drums it back to the night, every verse, with the little hitch before every name, and does not lose a word of it.',
        effects: [{ setFlag: 'skald.saga_drummed', value: true }, { trust: RG, set: 5 }], next: null,
      },
      plain: { speaker: 'narrator', text: 'An old Turning drum at the head of the Song stair. The skin is still warm.', next: null },
    },
  },
  // ---------- The Hollow Skalds (the Legion camp)
  skald(1,
    'Gisla Weatherdrum stands in the Legion with her drum slack on her hip. She drummed the weather on the relay for thirty years and was wrong for twenty-nine of them. Her eyes are full of black. You drum her name, with Ragna’s little hitch before it.',
    'Gisla blinks. She has no voice to say anything with, so she drums it instead, very fast: Rain. Rain by noon. It has never rained in the Heart, and it is not going to. You have never been so glad to hear a forecast.',
    'Where Gisla stood, a drum-mark scratched in the dirt: RAIN BY NOON.'),
  skald(2,
    'Orm Tarnwater, who could never keep time and drummed at every wedding on the Fells anyway, is standing very straight in the Legion’s rank, weeping. You drum his name in the long-message beat.',
    'Orm’s hands find his drum, and he drums your name back to you, a beat late, exactly like the Fells. Then he looks round at the Legion, and at his own black-stained hands, and sits down hard on the ground.',
    'Where Orm stood, the ground is scuffed in a rhythm that is very nearly in time.'),
  {
    id: 'dialogue:obj-skald-hollow-skald-3', name: 'The Hollow Skalds: Skald 3', scope: 'party',
    entries: [{ when: stage('quest:skald-the-hollow-skalds', 'names'), node: 'find' }, { node: 'plain' }],
    nodes: {
      find: { speaker: 'narrator', text: 'Old Bersi, who taught you the toast-beat when you were six, stands at the end of the rank. You drum his name. He wakes, and drums the toast-beat, loud, and half the Legion camp turns round. Then he drums, slower: Where is my voice?', next: 'ask' },
      ask: {
        speaker: 'narrator', text: 'The others are listening too, Gisla and Orm, their hands still on their drums.',
        choices: [
          { text: '(Drum: The Maestro fell. Your voices flew home. They are waiting for you on the Fells.)', to: 'home' },
          { text: '(Drum it the way the relay would, from valley to valley: Gone home. Gone home. Gone home.)', to: 'home', school: 'song' },
        ],
      },
      home: { speaker: 'narrator', mood: 'happy', text: 'Bersi drums it to the others, and the three of them pick up their drums and turn north, towards home. Then Gisla stops, and points her drumstick at the Legion’s muster-board, where their three marks are still chalked.', effects: [{ setFlag: 'skald.skalds_named', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Where the Fells Skalds stood, three pairs of bootprints going north.', next: null },
    },
  },
  // ---------- A Stone for Ulf (the Stone with No Saga, at the Heart)
  {
    id: 'dialogue:obj-skald-stair-stone', name: 'A Stone for Ulf: the stair-stone', scope: 'party',
    entries: [
      { when: { all: [stage('quest:skald-a-stone-for-ulf', 'cut'), { flag: 'skald.nemesis_fate', op: '==', value: 'spared' }] }, node: 'spared' },
      { when: stage('quest:skald-a-stone-for-ulf', 'cut'), node: 'alone' },
      { node: 'plain' },
    ],
    nodes: {
      spared: { speaker: UL, text: '(Ulf sits down on the next stair with his hands between his knees, and watches you set the chisel. Plain voice, rough:) Mine? On a stair? (A long pause.) Put my mother on it too. She was a cook.', next: 'cut' },
      alone: { speaker: 'narrator', mood: 'sad', text: 'There is a loose stone at the head of the Song stair, grey and plain and uncut. Ulf’s drum lies beside it with its skin split. You sit down beside it with a chisel, the way he used to sit by the stone on the Fells.', next: 'cut' },
      cut: {
        speaker: 'narrator', text: 'The chisel bites clean grey stone, with no black in the cut. How does it begin?',
        choices: [
          { text: '(Begin it on Scarrow Pike: a boy of nine, drumming every saga he knew at the sky.)', to: 'end', when: { flag: 'skald.ninehundredth' } },
          { text: '(Begin it under Ragna’s table: a boy learning nine hundred sagas by ear.)', to: 'end' },
          { text: '(Begin it the way he did, on the birch-bark from his camp: ULF, and then everything he could not choose.)', to: 'end', when: { flag: 'skald.ulf_camp', op: '==', value: 'bark' } },
          { text: '(Cut it as a drum-saga, every line a beat, so it can be drummed as well as read.)', to: 'end', school: 'song' },
        ],
      },
      end: { speaker: 'narrator', mood: 'sad', text: 'Ulf the Unsung, who knew every saga, and drummed them because they would not ring in his mouth. Plain stone. It will wear, one day, and somebody will have to cut it again, and say his name while they do. That is the point.', effects: [{ setFlag: 'skald.ulf_stone', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'A grey stair-stone at the head of the Song stair, cut with a saga in plain letters: ULF THE UNSUNG, WHO KNEW EVERY SAGA.', next: null },
    },
  },
];

export default dialogues;
