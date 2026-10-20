/** Hollow Crown, MONK Act III: the nemesis remade, the mentor’s last request and the Heart side quests. Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const ST = 'npc:shirin-tal' as const, KS = 'npc:kestrel' as const, YU = 'npc:auntie-yuen' as const, SOP = 'npc:little-brother-sop' as const;
const NOV = 'quest:monk-forty-novices' as const;

const dialogues: DialogueDef[] = [
  // ======================= ACT III
  // ---------- III-4 The Arms of the Chimera
  {
    id: 'dialogue:monk-herald-fate', name: 'III-4 the Arms of the Chimera: Kestrel’s fate', scope: 'party',
    entries: [
      { when: { flag: 'monk.cells', op: '==', value: 'stay' }, node: 'cell' },
      { when: { flag: 'monk.cells', op: '==', value: 'turned' }, node: 'doubt' },
      { node: 'kneel' },
    ],
    nodes: {
      cell: { speaker: KS, mood: 'hollow', text: 'You chose a cell over me, little one. In the Bell Courts, in front of everybody. I bowed very low, so you wouldn’t see my face.', next: 'kneel' },
      doubt: { speaker: KS, mood: 'hollow', text: 'He turned back. You said it in the Bell Courts, and I have been counting it on my beads ever since. Every time the arms swung at you, I counted it again. They kept missing.', next: 'kneel' },
      kneel: {
        speaker: KS, mood: 'hollow', text: '(He is on his knees inside the Chimera’s grey iron arms, the stolen Pit half fixed in one fist. The arms are still striking at the air without him.) I was good at it, wasn’t I? For once I was the best at something.',
        next: 'choose',
      },
      choose: {
        speaker: KS, mood: 'sad', text: 'Get up, then. Finish it. You never once gave up in your whole life, and I won’t be the first thing you give up on.',
        choices: [
          {
            text: '(Sit down on the stair, in the middle of the fight, and fold your hands.)', to: 'sit', quest: true,
            when: { any: [{ flag: 'monk.cells', op: '==', value: 'turned' }, { trust: ST, value: 'trusted' }] },
            lockedLabel: 'You need the truth told in the Bell Courts, or the Abbess’s trust',
            effects: [{ setFlag: 'monk.nemesis_fate', value: 'spared' }],
          },
          { text: '(Rise, and strike once, from stillness.)', to: 'strike', quest: true, effects: [{ setFlag: 'monk.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      sit: { speaker: 'narrator', text: 'You sit. The iron arms come down at your head and stop a hand’s breadth from it. Kestrel is staring at you. In thirty years he has never once seen you give up, and he does not know what to do.', next: 'sit2' },
      sit2: { speaker: 'narrator', text: 'The arms fall open. He crawls out of them and sits down beside you, because in the end he always copied you. The Pit half rolls away across the stone, singing, back towards its own bearer.', next: 'sit3' },
      sit3: { speaker: KS, mood: 'sad', text: 'Oh. That’s the move, is it? You just stop. (His thumb finds his beads. They are only wood again.) Mother cheats at everything, and she taught you that one fair.', next: null },
      strike: { speaker: 'narrator', text: 'One strike, from stillness, the way Shirin taught you both. The grey iron splits along its seams and Kestrel goes down with it, very quietly. His black beads roll down the Fist stair, one step at a time.', next: 'strike2' },
      strike2: { speaker: KS, mood: 'sad', text: '(Almost too quiet to hear.) That was a good one. That was the best one. Tell Mother I came home. Tell her I brought a goat.', next: null },
    },
  },
  // ---------- The Last Move (mentor’s last request)
  {
    id: 'dialogue:obj-monk-last-move-board', name: 'The Last Move: the Citadel threshold', scope: 'party',
    entries: [
      { when: { all: [stage('quest:monk-the-last-move', 'board'), { flag: 'monk.shirin_devotable' }] }, node: 'devoted' },
      { when: stage('quest:monk-the-last-move', 'board'), node: 'move' },
      { node: 'board' },
    ],
    nodes: {
      board: { speaker: 'narrator', text: 'The paving before the Citadel doors, laid in squares like a stones board. One white pebble sits on the fourth point from the corner, where it is not allowed to be.', next: null },
      move: { speaker: 'narrator', text: 'Before the Citadel doors, where Doran Kell should have stood in C. 1012, the paving is laid in squares like a board. You set a white pebble on the fourth point from the corner. It is not a legal move. Nobody checks.', next: 'draw' },
      draw: { speaker: 'narrator', text: 'You look at the board for a long time. It has come out even, stone for stone. Thirty years, and the Abbess has cheated her way to a draw, so that neither of them ever has to lose.', next: null },
      devoted: { speaker: 'narrator', text: 'You know Kell’s thirty answers by heart, from the arm of his throne. You lay them out on the paving before the Citadel doors, one by one, and then her move, white, on the fourth point from the corner, where it is not allowed to be.', next: 'devoted2' },
      devoted2: {
        speaker: 'narrator', text: 'A draw, stone for stone. Two old cheats, cheating towards the same place for thirty years. Far away, on landing six hundred, an abbess looks up from her tea and laughs out loud, and the porter has no idea why.',
        effects: [{ trust: ST, set: 5 }], next: null,
      },
    },
  },
  // ---------- Forty Novices
  {
    id: 'dialogue:monk-yuen-heart', name: 'Forty Novices: Auntie Yuen at the Heart camp', scope: 'party',
    entries: [{ when: stage(NOV, 'yuen'), node: 'pot' }, { node: 'pour' }],
    nodes: {
      pot: {
        speaker: YU, mood: 'happy', text: '(Auntie Yuen is sitting on an upturned crate at the edge of the Heart camp, with her pot on a brazier, telling a bearer from another school to sit up.) I said I would see you there with the pot. Here is there. Here is the pot.',
        choices: [{ text: 'You carried it all the way, Auntie?', to: 'carried' }, { text: 'The novices are in the Legion.', to: 'novices' }],
      },
      carried: { speaker: YU, text: 'Down the Thousand Stairs, through the Stair Gate and across a bog. The bog was rude. My mother lit this pot. It has not gone off the boil yet and it is not going to start for a crown.', next: 'novices' },
      novices: {
        speaker: YU, mood: 'sad', text: 'Forty of our children standing out there in the black, forgetting their names. Well. I have forty cups. Take them a cup each, and say their names while they drink it. Nobody stays lost with a cup of my tea in them.',
        choices: [{ text: '(Take the tray of cups.)', to: null, quest: true }],
      },
      pour: { speaker: YU, text: 'By name, mind. Every one. And make them sit up.', next: null },
    },
  },
  {
    id: 'dialogue:obj-monk-legion-novice-1', name: 'Forty Novices: the first novice', scope: 'party',
    entries: [
      { when: { all: [stage(NOV, 'novices'), { flag: 'monk.cells', op: '==', value: 'stay' }] }, node: 'stay' },
      { when: { all: [stage(NOV, 'novices'), { flag: 'monk.cells', op: '==', value: 'climb' }] }, node: 'climb' },
      { when: stage(NOV, 'novices'), node: 'turned' },
      { node: 'gone' },
    ],
    nodes: {
      stay: { speaker: 'narrator', text: 'Novice Imke Dorr, who swept the landing below yours. She walked out of the Bell Courts behind Kestrel on the morning you stayed. Now she stands in the Legion in grey, weeping black.', next: 'cup' },
      climb: { speaker: 'narrator', text: 'Novice Imke Dorr. You wore the grey beside her for a week, and she lent you her spare sandals. Now she stands in the Legion in that same grey, weeping black.', next: 'cup' },
      turned: { speaker: 'narrator', text: 'Novice Imke Dorr. She did not go with Kestrel that morning; she went after him, a week later, because somebody ought to. Now she stands in the Legion in grey, weeping black.', next: 'cup' },
      cup: { speaker: 'narrator', mood: 'happy', text: 'You put a cup of Auntie Yuen’s tea in her hands and say her name. She drinks. She makes a face. It is very strong. “Imke,” she says, as if trying it on. Then she sits down, and sits up.', next: null },
      gone: { speaker: 'narrator', text: 'An empty cup on the ground where a novice stood.', next: null },
    },
  },
  {
    id: 'dialogue:obj-monk-legion-novice-2', name: 'Forty Novices: the second novice', scope: 'party',
    entries: [{ when: stage(NOV, 'novices'), node: 'arno' }, { node: 'gone' }],
    nodes: {
      arno: { speaker: 'narrator', text: 'Brother Arno Penhale, who could never hold Crane Form for longer than a sneeze. He is holding it now, in the Legion, perfectly, and has been for a very long time.', next: 'cup' },
      cup: { speaker: 'narrator', text: 'You say his name and hold out the cup. Arno looks at it. Then he puts his foot down, wobbles, sneezes, and takes it in both hands. “Too much sugar,” he says, and starts to cry.', next: null },
      gone: { speaker: 'narrator', text: 'An empty cup on the ground where a novice stood.', next: null },
    },
  },
  {
    id: 'dialogue:obj-monk-legion-novice-3', name: 'Forty Novices: the youngest', scope: 'party',
    entries: [{ when: stage(NOV, 'novices'), node: 'yonten' }, { node: 'gone' }],
    nodes: {
      yonten: { speaker: 'narrator', text: 'Little Yonten, aged ten, the youngest of the forty, at the very end of the line. Kestrel gave him a sweet on the Prayer Terraces and remembered his name. Now nobody does.', next: 'cup' },
      cup: { speaker: 'narrator', text: '“Yonten,” you say. He drinks. Behind him the others are drinking too, cup after cup, and you go down the line saying every name until you have said forty. Auntie Yuen will want the cups back.', next: null },
      gone: { speaker: 'narrator', text: 'An empty cup on the ground where a novice stood.', next: null },
    },
  },
  // ---------- Sop on the Stair
  {
    id: 'dialogue:monk-sop-stair', name: 'Sop on the Stair: Little Brother Sop', scope: 'party',
    entries: [{ when: stage('quest:monk-sop-on-the-stair', 'stair'), node: 'asleep' }, { node: 'carried' }],
    nodes: {
      asleep: {
        speaker: 'narrator', text: 'Little Brother Sop, eight years old, asleep on the Fist stair three steps from the top, curled round his toy goat. Battles have gone up the stairs past him and down again. He is humming.',
        choices: [{ text: '(Wake him, gently.)', to: 'wake' }, { text: '(Sit beside him until he wakes by himself.)', to: 'sit', school: 'fist' }],
      },
      sit: { speaker: 'narrator', text: 'You sit and breathe beside him. After a while the humming stops and one eye opens. He does not seem at all surprised to see you.', next: 'wake' },
      wake: { speaker: SOP, mood: 'happy', text: 'I followed it. The song. All the way. It goes down the mountain, then through a gate, then there is a bog. Then it goes up. I got tired on the up. Is this the top?', next: 'top' },
      top: {
        speaker: SOP, text: 'Can I still have a nap? I think I’ve finished listening. It’s much quieter now you’re here.',
        choices: [{ text: '(Pick him up and carry him down.)', to: 'lift', quest: true }, { text: 'You can nap on my back.', to: 'lift', quest: true, trust: 1 }],
      },
      lift: { speaker: 'narrator', text: 'He weighs almost nothing. He is asleep again before you reach the bottom step, one fist full of your collar.', next: null },
      carried: { speaker: 'narrator', text: '(Sop is asleep on your back, snoring very slightly, a toy goat dangling from one hand.)', next: null },
    },
  },
  {
    id: 'dialogue:monk-yuen-sop', name: 'Sop on the Stair: Auntie Yuen', scope: 'party',
    entries: [{ node: 'sop' }],
    nodes: {
      sop: { speaker: YU, mood: 'angry', text: 'Is that Sop? Is that Little Brother Sop, on the far side of the world, in a cloak four sizes too big? (She has him off your back and wrapped in her shawl before you can answer.) Who let him come? Nobody let him. Of course nobody let him.', next: 'tea' },
      tea: { speaker: YU, mood: 'happy', text: 'Sit up. Drink. (Sop sits up, asleep, and drinks, asleep.) He can stay with me and the pot. Go on up, the rest of you. Some of us have a novice to mind.', effects: [{ setFlag: 'monk.sop_home', value: true }], next: null },
    },
  },
];

export default dialogues;
