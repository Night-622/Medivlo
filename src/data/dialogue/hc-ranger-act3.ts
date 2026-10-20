/** Hollow Crown, RANGER Act III: the nemesis remade, the mentor’s last request and the Heart side quests. Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const HB = 'npc:holt-barrow' as const, AM = 'npc:aldo-mire' as const;
const DEVOTABLE: NarrativeCondition = { flag: 'ranger.holt_devotable' };

const dialogues: DialogueDef[] = [
  // ======================= ACT III
  {
    id: 'dialogue:ranger-herald-fate', name: 'III-4 the Herald of Rot: Aldo’s fate', scope: 'party',
    entries: [{ when: { flag: 'ranger.line', value: 'burn' }, node: 'dog' }, { node: 'kneel' }],
    nodes: {
      kneel: { speaker: AM, mood: 'hollow', text: 'Mushroom? (He holds one out, from habit. It is grey all the way through.) No. Course not. Listen, pup. Hear that? Everything falling down, all at once. Isn’t it quiet?', next: 'hungry' },
      dog: { speaker: AM, mood: 'hollow', text: 'The Circle’s dog. Come up the stairs with a torch, have you? You burned the fen for them. Go on, then. Burn me too. You’re good at it.', next: 'hungry' },
      hungry: { speaker: AM, mood: 'sad', text: 'Only I’m still hungry. It all fell down and nothing grew, and I’m so hungry, pup. Why didn’t anything grow? Something always grows after.', next: 'choose' },
      choose: {
        speaker: AM, text: '(The hollow bell rolls out of his hand and down the stair, tonk, tonk, tonk.) Your turn, then. I always went first.',
        choices: [
          {
            text: '(Press the Old Rot’s living mould into his hands.)', to: 'mould', quest: true,
            when: { any: [{ flag: 'ranger.line', value: 'honest' }, { trust: HB, value: 'trusted' }] },
            lockedLabel: 'You need the Old Rot’s honest mould, or Holt’s trust',
            effects: [{ setFlag: 'ranger.nemesis_fate', value: 'spared' }],
          },
          { text: 'Let it fall, Aldo. All of it. You too. (End it.)', to: 'fall', quest: true, effects: [{ setFlag: 'ranger.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      mould: { speaker: 'narrator', text: 'The mould from the Old Rot is still damp, and smells of rain and bread. You close his grey hands round it. Under his fingers it does what honest rot has always done: it begins to make something.', next: 'mould2' },
      mould2: { speaker: AM, mood: 'sad', text: '(A beetle crawls out of the mould and over his thumb. He watches it as if it were the first he ever saw.) Oh. It’s meant to feed something. I forgot, pup. I forgot it was meant to feed something.', next: null },
      fall: { speaker: 'narrator', text: 'You let the Rot half sing, and the grey in him falls the way dead wood falls, all at once and gently. Aldo Mire lies back in the leaf-mould with a sigh, like a man settling into a bath.', next: 'fall2' },
      fall2: { speaker: AM, text: '(Very quietly.) Tell Holt… no. You tell him. You were always better at finishing things than me.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ranger-stair-blaze', name: 'Holt’s Last Blaze: the head of the Verdant stair', scope: 'party',
    entries: [
      { when: { all: [stage('quest:ranger-holts-last-blaze', 'carve'), { flag: 'ranger.holt_knife' }] }, node: 'knife' },
      { when: stage('quest:ranger-holts-last-blaze', 'carve'), node: 'quiver' },
      { node: 'blaze' },
    ],
    nodes: {
      knife: { speaker: 'narrator', text: 'You cut the blaze into the black stone at the head of the Verdant stair with Holt’s waymark knife: an arrow over three notches. As you work, the grip shifts under your thumb. Something is folded up inside it.', next: 'note' },
      quiver: { speaker: 'narrator', text: 'You cut the blaze into the black stone at the head of the Verdant stair: an arrow over three notches. When you sheathe your knife, your fingers find a scrap of bark sewn into your quiver’s lining that was not there in the Thornwilds.', next: 'note' },
      note: { speaker: 'narrator', text: 'Birch bark, folded small, in Holt’s square hand. Holt does not write. He has written this. It says: “The end of it. In case. H.”', effects: [{ giveItem: 'i_holts_punchline' }], next: 'joke' },
      joke: { speaker: HB, text: '“A beetle, a boar and a Circle witch walk into the Thornwilds. The beetle says to the boar, ‘Path’s moved.’ The boar says, ‘Course it has.’ The witch says, ‘I shall raise it with the Circle.’ And the path says: ‘Hm.’”', next: 'terrible' },
      terrible: {
        speaker: 'narrator', text: 'It is terrible. It is the worst joke you have ever heard. It has taken him the whole of your life.',
        // the beat completes the quest only once the scene has played (so the Devoted node cannot be skipped)
        effects: [{ setFlag: 'ranger.stair_blazed', value: true }],
        choices: [
          { text: '(Laugh.)', to: 'devoted', when: DEVOTABLE },
          { text: '(Laugh.)', to: 'plain', when: { not: DEVOTABLE } },
        ],
      },
      devoted: {
        speaker: 'narrator', mood: 'happy', text: 'You laugh out loud at the top of the world, and the bearers turn to look. Far away at the Wayfarers’ fire, an old man who smells of pine looks up from his whetstone and, for no reason anyone there can see, grins.',
        effects: [{ trust: HB, set: 5 }], next: null,
      },
      plain: { speaker: 'narrator', text: 'You laugh out loud at the top of the world, until the other bearers turn to look. Then you fold the bark away somewhere safe. Whoever climbs this stair now will know a Wayfarer walked this far.', next: null },
      blaze: { speaker: 'narrator', text: 'A Wayfarer blaze at the head of the Verdant stair: an arrow over three notches, still white where the knife went in.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ranger-aldo-garden', name: 'Aldo’s Garden', scope: 'party',
    entries: [
      { when: { all: [stage('quest:ranger-aldos-garden', 'plant'), { flag: 'ranger.nemesis_fate', value: 'spared' }] }, node: 'spared' },
      { when: stage('quest:ranger-aldos-garden', 'plant'), node: 'plant' },
      { node: 'rows' },
    ],
    nodes: {
      spared: { speaker: 'narrator', text: 'Aldo kneels beside you at the Heart camp in a borrowed Wayfarer blanket. Together you pack his old bell with the honest rot by your bedroll and plant his barren mushrooms in it, a hand apart, the way he always planted leeks.', next: 'up' },
      up: { speaker: AM, mood: 'happy', text: '(By morning there is a brown cap in the row, small and lopsided, dropping spores like anybody’s. He looks at it for a long time.) It’s ugly, pup. It’s the best thing I ever grew.', next: null },
      plant: { speaker: 'narrator', text: 'You pack Aldo’s old bell with the honest rot by your bedroll and plant the last of his barren mushrooms in it, a hand apart, the way he always planted leeks. Nothing comes up. They only sit there, perfect, and slowly go to dust.', next: null },
      rows: { speaker: 'narrator', text: 'A patch of dark, honest leaf-mould at the edge of the Heart camp, planted in neat rows.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ranger-salt-pole', name: 'The Salt Thief Abroad', scope: 'party',
    entries: [{ when: stage('quest:ranger-the-salt-thief-abroad', 'chase'), node: 'pole' }, { node: 'after' }],
    nodes: {
      pole: { speaker: 'narrator', text: 'You find it at the top of the tallest tent-pole in the camp, fat as a loaf, sitting on a heap of salt it has somehow carried from the Thornwilds a pinch at a time. Every bearer in the camp has come out to watch.', next: 'stare' },
      stare: {
        speaker: 'narrator', text: 'It looks at you. You look at it. Eleven years of victory, and a year in your socks.',
        choices: [
          { text: '(Grab for it.)', to: 'grab' },
          { text: '(Hold out a pinch of salt, palm open.)', to: 'salt' },
        ],
      },
      grab: { speaker: 'narrator', text: 'You climb. It is not there. It is on the next pole. It is on somebody’s helmet. It is back on its heap, washing its whiskers, and you are halfway up a tent.', next: 'leap' },
      salt: { speaker: 'narrator', text: 'It looks at your pinch of salt. It looks at the heap it is sitting on. It gives you a look of enormous pity.', next: 'leap' },
      leap: { speaker: 'narrator', text: 'Then it gathers up as much salt as one squirrel can carry, which is a great deal, leaps off the pole into the Heart, and is gone. The bearers applaud. Somebody is already taking bets on whether it reaches the Citadel first.', next: 'acorn' },
      acorn: { speaker: 'narrator', mood: 'happy', text: 'In your pack, among your socks, where it slept for a year, it has left you a single acorn. For variety.', next: null },
      after: { speaker: 'narrator', text: 'The tallest tent-pole in the Heart camp. There is salt on the top of it.', next: null },
    },
  },
];

export default dialogues;
