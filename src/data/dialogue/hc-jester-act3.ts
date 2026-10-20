/** Hollow Crown, JESTER Act III: the nemesis remade, the mentor’s last request and the Heart side quests. Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const FE = 'npc:fennick-pantaloon' as const, SO = 'npc:harlequin-sorrow' as const;
const GULL = 'npc:gull-number-nine-concordia' as const;
const DEVOTABLE: NarrativeCondition = { flag: 'jester.fennick_devotable' };

const dialogues: DialogueDef[] = [
  // ---------- III-4 The Last Laugh
  {
    id: 'dialogue:jester-herald-fate', name: 'III-4 the Last Laugh: Sorrow’s fate', scope: 'party',
    entries: [
      { when: { flag: 'jester.jest', op: '==', value: 'king' }, node: 'claque' },
      { when: { flag: 'jester.jest', op: '==', value: 'licence' }, node: 'cracked' },
      { node: 'down' },
    ],
    nodes: {
      claque: { speaker: SO, mood: 'hollow', text: 'Hear them? That’s your claque, little fool. You read my jest at the Jubilee, and they have laughed louder for me ever since. (The laughter pours out of the Chimera on cue, and does not stop.)', next: 'down' },
      cracked: { speaker: 'narrator', text: 'The white mask that is the Chimera’s face is cracked from brow to chin, where an old King once laughed at the truth. Behind the crack, somebody is breathing very fast.', next: 'down' },
      down: { speaker: SO, mood: 'hollow', text: 'Every laugh I ever sold, called in at once, with interest. I can’t make it stop. (The great patchwork body shakes with it.) It doesn’t stop when I’m hurt. It never did.', next: 'choose' },
      choose: {
        speaker: SO, mood: 'sad', text: 'Well, little fool? You’re the only one on these stairs who isn’t laughing. Close the account.',
        choices: [
          {
            text: '(Take out the jar labelled “H. Sorrow, aged seven”, and break it on the stair.)', to: 'jar', quest: true,
            when: { any: [{ flag: 'jester.jest', op: '==', value: 'licence' }, { trust: FE, value: 'trusted' }] },
            lockedLabel: 'You need the Fool’s Licence, or Fennick’s trust',
            effects: [{ setFlag: 'jester.nemesis_fate', value: 'spared' }],
          },
          { text: 'The show’s over, Sorrow. (Lift the mask away.)', to: 'mask', quest: true, effects: [{ setFlag: 'jester.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      jar: { speaker: 'narrator', text: 'The jar breaks, and the little pearl inside cracks like an egg, and out of it comes a sound nobody in Velvet Harbour has ever heard: a boy of seven, crying his heart out. Every laugh in the Chimera stops at once.', next: 'jar2' },
      jar2: { speaker: SO, mood: 'sad', text: '(The mask slides off, and pearls pour from his sleeves down the stair. Under it is a thin grey man, weeping like a child.) A painted boat. I lost it off the end of the Docks. I couldn’t bear it, so I sold it. Oh, it hurts. Don’t take it away.', next: null },
      mask: { speaker: 'narrator', text: 'You lift the white mask from the Chimera’s face, gently, the way you would take one from a sleeping child. The laughter stops. Underneath there is nothing at all. Black pearls roll away down the stair, and the jar in your pocket stays whole.', next: null },
    },
  },
  // ---------- The Joke for the King (the mentor’s last request)
  {
    id: 'dialogue:jester-heart-letter', name: 'The Joke for the King: Fennick’s letter', scope: 'party',
    entries: [{ when: { flag: 'jester.gull_saved' }, node: 'gull' }, { node: 'pigeon' }],
    nodes: {
      gull: { speaker: GULL, text: '(Gull Number Nine drops out of the black air over the Wall onto a tent-pole, with a letter in its beak and a chip from somewhere. It has, apparently, been home. It drops the letter on your boot and eats the chip, looking you in the eye.)', next: 'l1' },
      pigeon: { speaker: 'npc:court-pigeon', text: '(A Velvet Court pigeon in a tiny velvet ribbon comes down out of the black air over the Wall, exhausted and dignified, and lands on your shoulder. There is a letter on its leg. It bows. It actually bows.)', next: 'l1' },
      l1: { speaker: FE, text: '(Drawings first: Fennick falling over a tent, a staircase, a crown.) “Nearly fifty years ago a little prince visited the Velvet Court. Every fool in Tidecourt did their best for him. He was the only child in the room who never laughed. Not once.”', next: 'l2' },
      l2: { speaker: FE, mood: 'sad', text: '“It wasn’t his fault. The Court tells its jokes to music, a little tune for every one, and he couldn’t hear the tunes. So I went home and wrote him one with no music in it at all. In the morning he had gone back to the Citadel.”', next: 'l3' },
      l3: {
        speaker: FE, text: '“I think he’s at the end of your road. The joke is copied out below. Tell it on the top step, loud, facing the back row, the way I taught you. Then fall over. The falling over is important. F.”',
        choices: [{ text: '(Fold the letter away for the top of the stairs.)', to: null, quest: true, effects: [{ setFlag: 'jester.king_joke', value: true }] }],
      },
    },
  },
  {
    id: 'dialogue:obj-jester-citadel-step', name: 'The Joke for the King: the top step', scope: 'party',
    entries: [{ when: stage('quest:jester-the-joke-for-the-king', 'tell'), node: 'step' }, { node: 'plain' }],
    nodes: {
      step: { speaker: 'narrator', text: 'The Citadel doors stand open on a long dark hall, as they have for thirty years. Somewhere at the far end of it, a man is weeping. You stand on the top step, face the back row, and unfold Fennick’s letter.', next: 'joke' },
      joke: { speaker: 'narrator', text: '“Your Highness! Who is the finest singer in the whole Velvet Court?” (A pause, as Fennick wrote it: a long one.) “You are, sir. In nine whole years, you have never once sung a wrong note.”', next: 'fall' },
      fall: { speaker: 'narrator', text: 'Then you fall over, flat, the Pantaloon way, because the falling over is important. The dark hall swallows the joke whole. For a long moment, nothing.', next: 'breath' },
      breath: {
        speaker: 'narrator', mood: 'sad', text: 'Then, far away down the dark, the weeping stops, for exactly one breath, the way a small boy stops crying when he is trying to work out whether something was funny.',
        effects: [{ setFlag: 'jester.king_joke_told', value: true }],
        choices: [
          { text: '(Get up.)', to: 'devoted', when: DEVOTABLE },
          { text: '(Get up.)', to: null, when: { not: DEVOTABLE } },
        ],
      },
      devoted: {
        speaker: 'narrator', mood: 'happy', text: 'Far away in Velvet Harbour, in a sail-loft full of cushions, an old fool sits up as if somebody had called his name. Then he laughs, and falls off his cushion on purpose, and lies there on the floor, smiling at the rafters.',
        effects: [{ trust: FE, set: 5 }], next: null,
      },
      plain: { speaker: 'narrator', text: 'The top step of the Twelve Stairs, before the open Citadel doors. There is a scuff on it where a fool fell over.', next: null },
    },
  },
  // ---------- Paid in Full
  {
    id: 'dialogue:obj-jester-legion-customers', name: 'Paid in Full: Sorrow’s customers', scope: 'party',
    entries: [
      { when: { all: [stage('quest:jester-paid-in-full', 'pearls'), { flag: 'jester.nemesis_fate', op: '==', value: 'spared' }] }, node: 'sorrow' },
      { when: stage('quest:jester-paid-in-full', 'pearls'), node: 'line' },
      { node: 'gone' },
    ],
    nodes: {
      sorrow: { speaker: 'narrator', text: 'Sorrow has followed you down from the stair, unmasked, red-eyed, his sleeves full of the pearls that fell. He goes along the line of his best customers handing them back, one at a time, and says sorry to every one.', next: 'cup' },
      line: { speaker: 'narrator', text: 'Sorrow’s best customers stand in their own rank in the Legion, smiling at nothing, still holding his receipts. The pearls from the stair are cold in your hands. Held near the one who wept it, each pearl warms.', next: 'cup' },
      cup: {
        speaker: 'narrator', text: 'The woman from the shop with the red door, who wept into a cup and left laughing, takes her pearl and holds it to her cheek. Then, quite quietly, she begins to cry.',
        choices: [
          { text: '(Give her your handkerchief.)', to: 'kerchief' },
          { text: '(Tell the whole line the worst joke in Tidecourt, so they can cry and laugh at once.)', to: 'worst', school: 'guile' },
        ],
      },
      kerchief: { speaker: 'narrator', text: 'She blows her nose on it, enormously, and laughs at herself for doing it, a small real laugh. Down the line, one by one, the others start to weep. It is the best sound you have heard in the Heart.', next: null },
      worst: { speaker: 'narrator', mood: 'happy', text: 'It is the one about the pawnbroker and the road. Nobody laughs. Then somebody does, through tears, and then the whole line is weeping and laughing at once, which is the right way round at last.', next: null },
      gone: { speaker: 'narrator', text: 'Where Sorrow’s customers stood, a neat row of receipts laid on the ground, every one marked paid.', next: null },
    },
  },
  // ---------- Gull Number Nine Goes Straight
  {
    id: 'dialogue:jester-gull-heart', name: 'Gull Number Nine Goes Straight', scope: 'party',
    entries: [{ when: stage('quest:jester-gull-number-nine-goes-straight', 'gull'), node: 'plume' }, { node: 'idle' }],
    nodes: {
      plume: { speaker: GULL, text: '(Gull Number Nine is on a tent-pole wearing a Black Tear Knight’s plume, which is three times the size of the gull. It looks at you. It looks at the plume. Very slowly, it lays the plume at your feet.)', next: 'chip' },
      chip: {
        speaker: 'narrator', text: 'Then, after a long and visible struggle, it lays its last chip beside the plume. Forty-one convictions, and this is the first thing it has ever given anybody. Gull Number Nine has gone straight.',
        choices: [
          { text: '(Put the plume in your cap.)', to: 'cap', effects: [{ setFlag: 'jester.gull_plume', value: 'cap' }, { giveItem: 'i_black_tear_plume' }] },
          { text: '(Give the plume back to the gull. It earned it.)', to: 'gull', effects: [{ setFlag: 'jester.gull_plume', value: 'gull' }] },
          { text: '(Eat the chip. Respectfully.)', to: 'eat', school: 'guile', effects: [{ setFlag: 'jester.gull_plume', value: 'chip' }] },
        ],
      },
      cap: { speaker: 'narrator', mood: 'happy', text: 'You will wear it up the stairs. It is enormous, absurd and black as a funeral, and every bearer in the camp laughs at you, which is the point.', next: null },
      gull: { speaker: 'narrator', mood: 'happy', text: 'The gull puts the plume on and struts the whole length of the camp, magnificent. Constable Prigg would be appalled. Fennick would fall over.', next: null },
      eat: { speaker: 'narrator', text: 'The gull watches you eat it with an expression of deep personal betrayal, and then, slowly, of something like respect.', next: null },
      idle: { speaker: GULL, text: '(Gull Number Nine is watching the bearers’ supper with professional interest. It has not stolen anything for nearly an hour.)', next: null },
    },
  },
];

export default dialogues;
