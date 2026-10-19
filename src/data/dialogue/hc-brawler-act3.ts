/** Hollow Crown, BRAWLER Act III: the nemesis remade, the mentor’s last request and the Heart side quests. Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const TK = 'npc:tobiah-knuckle' as const, SG = 'npc:silas-gaunt' as const, TI = 'npc:tilly-concordia' as const, OX = 'npc:big-mother-ox' as const;
const STOCK = 'quest:brawler-pops-stock' as const, NAMES = 'quest:brawler-calling-the-names' as const, OXQ = 'quest:brawler-big-mother-ox-comes-through' as const;

const dialogues: DialogueDef[] = [
  // ======================= ACT III
  // ---------- III-4 The Promoter’s Corner
  {
    id: 'dialogue:brawler-herald-fate', name: 'III-4 the Promoter’s Corner: Silas’s fate', scope: 'party',
    entries: [{ when: { flag: 'brawler.purse', op: '==', value: 'league' }, node: 'belt' }, { node: 'kneel' }],
    nodes: {
      belt: { speaker: SG, mood: 'hollow', text: 'You fought for a belt, champion. A belt! I could have got you ten belts. I could have got you a belt with a smaller belt on it. You fought for a belt, and look which of us ended up in the iron.', next: 'kneel' },
      kneel: {
        speaker: SG, mood: 'hollow', text: '(He is fixed into the Chimera’s chest like a bell in a tower, and the iron keeps throwing punches round him.) Round twelve. Round thirteen. I call them and it fights them. Best corner I ever had. Nobody ever stops it.',
        next: 'choose',
      },
      choose: {
        speaker: SG, mood: 'sad', text: 'Well? Somebody has to stop it, and it won’t be me. I don’t stop things. I sell tickets to them.',
        choices: [
          {
            text: '(Take out Pops’s towel, and throw it in.)', to: 'towel', quest: true,
            when: { all: [{ flag: 'brawler.pops_towel' }, { any: [{ flag: 'brawler.purse', op: '==', value: 'names' }, { trust: TK, value: 'trusted' }] }] },
            lockedLabel: 'You need Pops’s towel, and to know what it once saved',
            effects: [{ setFlag: 'brawler.nemesis_fate', value: 'spared' }],
          },
          { text: '(Square up, and finish the bout.)', to: 'finish', quest: true, effects: [{ setFlag: 'brawler.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      towel: { speaker: 'narrator', text: 'The towel lands on the stone in front of him, white, forty years in a corner. The Chimera stops dead in the middle of a swing. Nobody throws in the towel for the Promoter. Nobody ever has, except once.', next: 'towel2' },
      towel2: { speaker: 'narrator', text: 'Silas climbs out of the iron chest, shaking, and the Summit half he stole drops out after him and rolls away, singing, towards its own bearer. He picks up the towel. He touches the scar under his eye.', next: 'towel3' },
      towel3: { speaker: SG, mood: 'sad', text: 'He threw it in for me once. I never thanked him. (Very quietly.) Tell him I lost. Tell him somebody stopped it. Tell him… no. I’ll tell him.', next: null },
      finish: { speaker: 'narrator', text: 'You go to work on the chest, hands up, chin down, until the iron caves and the voice inside it stops calling rounds. Silas lies in the wreck with his scarf come loose, his kind eyes open and only tired.', next: 'finish2' },
      finish2: { speaker: SG, mood: 'sad', text: '(A whisper.) Good bout, champion. Best I ever promoted. Don’t let anybody sell tickets to it.', next: null },
    },
  },
  // ---------- Pops’s Stock (mentor’s last request)
  {
    id: 'dialogue:brawler-tilly-heart', name: 'Pops’s Stock: Tilly at the Heart camp', scope: 'party',
    entries: [{ when: stage(STOCK, 'tilly'), node: 'pot' }, { node: 'later' }],
    nodes: {
      pot: {
        speaker: TI, mood: 'happy', text: '(Tin-Can Tilly is sitting on a stock-pot the size of a barrel, on a handcart, at the edge of the Heart camp, with her arms folded.) I wasn’t supposed to come. Again. I came. Again. I pushed it the whole way. It’s Pops’s stock.',
        choices: [{ text: 'Tilly. That’s the whole stock.', to: 'whole' }, { text: 'What did Pops say?', to: 'menu' }],
      },
      whole: { speaker: TI, text: 'Since C. 1003. He cried when it went. He said he wasn’t crying. He said it was the onions. There aren’t any onions in it.', next: 'menu' },
      menu: { speaker: TK, text: '(On the back of a noodle menu, in pencil:) “Put it on the boil at the foot of the stairs, where the lost ones are standing. Let the wind take it. Nobody ever stayed hollow who could smell my stock. P.”', next: 'go' },
      go: {
        speaker: TI, text: 'You light it. I’m the corner. Corners don’t light things, they hold the bucket. (She hands you a tinderbox, very seriously. It drips.)',
        choices: [{ text: '(Take the tinderbox.)', to: null, quest: true }],
      },
      later: { speaker: TI, text: 'Go on, light it. Foot of the stairs, where the lost ones are. I’ll hold the bucket.', next: null },
    },
  },
  {
    id: 'dialogue:obj-brawler-stock-pot', name: 'Pops’s Stock: the pot at the foot of the stairs', scope: 'party',
    entries: [
      { when: { all: [stage(STOCK, 'pot'), { flag: 'brawler.pops_devotable' }] }, node: 'devoted' },
      { when: stage(STOCK, 'pot'), node: 'boil' },
      { node: 'pot' },
    ],
    nodes: {
      pot: { speaker: 'narrator', text: 'Pops’s stock-pot, bubbling at the foot of the Twelve Stairs. Somebody has left a ladle in it, and a queue of very quiet people has formed.', next: null },
      boil: { speaker: 'narrator', text: 'You set the pot on a fire at the foot of the Twelve Stairs and let it come up to the boil. The steam goes out across the Legion camp on the wind, beef and bone and forty years of evenings.', next: 'boil2' },
      boil2: { speaker: 'narrator', mood: 'happy', text: 'Out in the ranks, here and there, a hollow head turns. Then another. Somebody in Lowfold wraps says, quite clearly, “Number nine,” and does not know why.', next: null },
      devoted: { speaker: 'narrator', text: 'You set the pot on a fire at the foot of the Twelve Stairs. As it comes to the boil the steam smells of rain on hot stone: Marta’s rainwort, the last thing it was missing. It goes out across the Legion camp like a hand on a shoulder.', next: 'devoted2' },
      devoted2: {
        speaker: 'narrator', text: 'Heads turn all through the ranks. Far away in Knuckletown, an old man behind a noodle cart stops ladling, sniffs the air, says “That’s it, kid,” to nobody at all, and sits down on his stool.',
        effects: [{ trust: TK, set: 5 }], next: null,
      },
    },
  },
  // ---------- Calling the Names
  {
    id: 'dialogue:obj-brawler-sold-fighter-1', name: 'Calling the Names: Peg Shaw', scope: 'party',
    entries: [{ when: stage(NAMES, 'names'), node: 'peg' }, { node: 'gone' }],
    nodes: {
      peg: { speaker: 'narrator', text: 'A woman in Lowfold wraps, standing in the Legion with her fists up and nobody in front of her. You unfold Pops’s list. Peg Shaw, it says, near the top.', next: 'call' },
      call: { speaker: 'narrator', mood: 'happy', text: 'You call it the way they call fighters into a ring: “Peg Shaw!” She turns round, slowly, the way people turn when somebody shouts their name across a street. Her fists come down.', next: null },
      gone: { speaker: 'narrator', text: 'A pair of fighter’s wraps, folded on the ground, where Peg Shaw stood.', next: null },
    },
  },
  {
    id: 'dialogue:obj-brawler-sold-fighter-2', name: 'Calling the Names: Young Halloran', scope: 'party',
    entries: [{ when: stage(NAMES, 'names'), node: 'hal' }, { node: 'gone' }],
    nodes: {
      hal: { speaker: 'narrator', text: 'A boy with a little boxing glove tattooed on his wrist, the same one that was scratched beside his name on the quarry wall. He went home from the Broken Fist dojo. Silas found him again.', next: 'call' },
      call: { speaker: 'narrator', text: '“Young Halloran!” He turns round. He looks at you, and at his own wrist, and says, “I’m not young, I’m seventeen,” and is suddenly, furiously, himself again.', next: null },
      gone: { speaker: 'narrator', text: 'A pair of fighter’s wraps, folded on the ground, where Young Halloran stood.', next: null },
    },
  },
  {
    id: 'dialogue:obj-brawler-sold-fighter-3', name: 'Calling the Names: the rest of the list', scope: 'party',
    entries: [
      { when: { all: [stage(NAMES, 'names'), { flag: 'brawler.purse', op: '==', value: 'climbers' }] }, node: 'more' },
      { when: stage(NAMES, 'names'), node: 'kezia' },
      { node: 'gone' },
    ],
    nodes: {
      kezia: { speaker: 'narrator', text: '“Kezia Hobday!” A bare-knuckle grandmother from the Goat Paths turns round. Then you read on, down the whole list, and they turn, one by one, all down the line. Not every name answers. You read those twice.', next: 'end' },
      more: { speaker: 'narrator', text: '“Kezia Hobday!” She turns. Then you read on down the list, and they turn, one by one. The Climbers stormed two outlaw rings before the tunnel could take everyone, and the line is short. Nearly every name answers.', next: 'end' },
      end: { speaker: 'narrator', text: 'When you get to the end, two hundred and twelve, the fighters who heard their names are all facing the same way: towards you, and the corner, and home.', next: null },
      gone: { speaker: 'narrator', text: 'Folded wraps on the ground, in a long, neat row.', next: null },
    },
  },
  // ---------- Big Mother Ox Comes Through
  {
    id: 'dialogue:brawler-ox-heart', name: 'Big Mother Ox Comes Through', scope: 'party',
    entries: [
      { when: stage(OXQ, 'down'), node: 'over' },
      { when: stage(OXQ, 'over'), node: 'wait' },
      { node: 'stair' },
    ],
    nodes: {
      stair: {
        speaker: OX, text: '(Big Mother Ox is standing at the top of the Fist stair with her arms folded. The stair looks smaller with her on it.) Concordia. Hm. Flat. Damp. Everybody whispers. I came through to see what all the fuss was about. It’s a staircase.',
        choices: [{ text: 'You walked all the way from the Grand Pit?', to: 'walk' }, { text: 'Why are you here, Ox?', to: 'why' }],
      },
      walk: { speaker: OX, text: 'Nineteen years I couldn’t lie down. Now I can, and I don’t fancy it yet. So I walked. A heron looked at me in a bog. I looked back. The heron left.', next: 'why' },
      why: {
        speaker: OX, mood: 'sad', text: 'He’s up there. The Promoter. I can hear him calling rounds. I’m going to stand on this stair until it’s over, so he can see one of the ones he sold standing up.',
        choices: [{ text: 'Then stand, Ox. I’ll be back.', to: null, quest: true }],
      },
      wait: { speaker: OX, text: 'Not yet. I can still hear him. Go on. I’m not going anywhere. I’m very good at not going anywhere.', next: null },
      over: {
        speaker: OX, text: 'It’s quiet. (She listens for a long time.) Is it over?',
        choices: [
          { text: 'It’s over. I threw in the towel for him.', to: 'spared', when: { flag: 'brawler.nemesis_fate', op: '==', value: 'spared' }, quest: true },
          { text: 'It’s over. He won’t call another round.', to: 'gone', when: { flag: 'brawler.nemesis_fate', op: '==', value: 'destroyed' }, quest: true },
        ],
      },
      spared: { speaker: OX, text: 'You saved him. Him. (She almost laughs.) That’s Pops’s doing, that is. That’s a cornerman’s answer. All right. All right.', next: 'down' },
      gone: { speaker: OX, mood: 'sad', text: 'Good. No. Not good. Over. (She unfolds her arms.) I wanted to hate him for longer. I’m too tired.', next: 'down' },
      down: { speaker: 'narrator', mood: 'happy', text: 'Big Mother Ox sits down on the Fist stair. Then, slowly, like a tree deciding to, she lies down across three steps of it and closes her eyes. In a minute she is snoring. Nobody in the Heart dares to step over her.', next: null },
    },
  },
];

export default dialogues;
