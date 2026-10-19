/**
 * Hollow Crown, the Greywilds: scenes both Hunt campaigns share (the Antler Gate seal and the Great Hunt's tine at the
 * gate, and the Hollis Lodge folk's general talk in Concordia). Class-specific entries first; the gate is one place
 * reached from both the Antlerford and the Hawkmoor side. Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

const stage = (q: `quest:${string}`, s: string): NarrativeCondition => ({ questStage: q, stage: s });

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-hunt-gate-seal', name: 'I-10 opening the Antler Gate', scope: 'party',
    entries: [
      { when: { all: [stage('quest:huntsman-the-antler-gate', 'gate'), { flag: 'huntsman.hounds_run' }] }, node: 'hsh' },
      { when: stage('quest:huntsman-the-antler-gate', 'gate'), node: 'hs' },
      { when: { all: [stage('quest:falconer-the-antler-gate', 'gate'), { flag: 'falconer.fledglings' }] }, node: 'faf' },
      { when: stage('quest:falconer-the-antler-gate', 'gate'), node: 'fa' },
      { node: 'seal' },
    ],
    nodes: {
      hsh: { speaker: 'narrator', text: 'The Antler Gate is an arch of olive stone carved into a thicket of antlers, all twelve schools’ marks hidden among the tines, and black tears run down every point. The Lodge hounds are sitting in a ring round the foot of it, all facing in, as if they had been waiting there all along.', next: 'hounds' },
      hounds: { speaker: 'narrator', text: 'They ran with you the whole way round the gate ring and never once barked. Jem Furlong could not have held them, and he did not try. You hold up the Lodge half. It sings, and the gate answers.', next: 'corva' },
      hs: { speaker: 'narrator', text: 'The Antler Gate is an arch of olive stone carved into a thicket of antlers, all twelve schools’ marks hidden among the tines, and black tears run down every point. You hold up the Lodge half. It sings, and the gate answers.', next: 'corva' },
      corva: { speaker: 'narrator', text: 'On the ridge, the place where Corva Ashby lay with her crossbow is empty. Fresh hoofprints, shod in silver, lead down to the gate, and through it.', next: 'through' },
      faf: { speaker: 'narrator', text: 'The Antler Gate is an arch of olive stone carved into a thicket of antlers, all twelve schools’ marks hidden among the tines. Overhead the Featherfall fledglings, unhooded and half grown, loop once round the arch as if to see you off. They flew the whole fight with your hawk and never once flinched.', next: 'fa' },
      fa: { speaker: 'narrator', text: 'Every bird on the Hawkmoor seems to be sitting on the gate. Your hawk comes down onto your fist without being called. You hold up the Moor half. It sings, and the gate answers.', next: 'hood' },
      hood: { speaker: 'narrator', text: 'On the keystone, a single soft leather hood, wet on the inside, has been left behind. The Hooded Man is already through.', next: 'through' },
      through: { speaker: 'narrator', text: 'Slowly, for the first time in thirty years, the Antler Gate opens. Beyond it is a road, and a green moor at dusk, and somewhere far ahead, a bell.', next: null },
      seal: { speaker: 'narrator', text: 'The Antler Gate stands open. Concordia lies beyond.', next: null },
    },
  },
  {
    id: 'dialogue:obj-great-hunt-tine', name: 'I-10 the Great Hunt’s tine', scope: 'party',
    entries: [
      { when: { all: [stage('quest:huntsman-the-antler-gate', 'tine'), { not: { flag: 'huntsman.tine' } }, { flag: 'huntsman.calf_home' }] }, node: 'huntc' },
      { when: { all: [stage('quest:huntsman-the-antler-gate', 'tine'), { not: { flag: 'huntsman.tine' } }] }, node: 'hunt' },
      { node: 'gone' },
    ],
    nodes: {
      huntc: { speaker: 'narrator', text: 'The Great Hunt stands at the head of the gate road, run to a standstill, its sides heaving. Close against its flank, all legs and ears, is the calf from the Elkway, still without a speck of black on it. It must have come up the road in the night to find the herd.', next: 'hunt' },
      hunt: { speaker: 'narrator', text: 'The black has dripped off the Great Hunt’s antlers and they are burning gold again, like a forest in autumn sun. It lowers its great head to you, and holds out one tine.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'The old law says take only what the hunt gives. It is giving.',
        choices: [
          { text: '[Take the tine.]', to: 'take', effects: [{ setFlag: 'huntsman.tine', value: 'taken' }] },
          { text: 'Take nothing. Put your hands behind your back.', to: 'nothing', effects: [{ setFlag: 'huntsman.tine', value: 'nothing' }] },
        ],
      },
      take: { speaker: 'narrator', text: 'It comes away in your hand, warm and light as a dry branch, still glowing faintly at the tip. The Great Hunt lifts its head, turns, and leads the herd back up the Elkway at a walk.', next: null },
      nothing: { speaker: 'narrator', text: 'You put your hands behind your back. The Great Hunt looks at you for a long moment, as if that were the right answer to a question you had not heard. Then it lifts its head, turns, and leads the herd back up the Elkway at a walk.', next: null },
      gone: { speaker: 'narrator', text: 'Gold hoofprints on the gate road, fading, all pointing north.', next: null },
    },
  },
  // ---------- Hollis Lodge folk (general talk, any campaign)
  {
    id: 'dialogue:hunt-thaddeus', name: 'Thaddeus Hollis (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:thaddeus-hollis', text: 'Hollis Lodge. Last Hunt lodge this side of the arches. Sit, if you like. The fire’s free and the tea is terrible.',
        choices: [
          { text: 'How did you end up in Concordia?', to: 'how' },
          { text: 'Where is Maren?', to: 'maren' },
          { text: 'Farewell.', to: null, tag: 'leave' },
        ],
      },
      how: { speaker: 'npc:thaddeus-hollis', text: 'Came over in C. 1011 to sell elk-horn at the Turning fair. Then there was no Turning, and no fair, and no way home. I married. I stayed. My brother’s girl had Maren, and then she went into the Heart with her stone.', next: 'start' },
      maren: { speaker: 'npc:thaddeus-hollis', mood: 'sad', text: 'Off. She’s always off. Hunting the thing that took her mother, though she won’t say it like that. Tell her to eat.', next: 'start' },
    },
  },
  {
    id: 'dialogue:hunt-prudence', name: 'Prudence Gannet (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:prudence-gannet', text: 'Mind the birds. They bite, and they’re right to. Fish? Two a copper, if the birds leave any.',
        choices: [
          { text: 'How do you fish with cormorants?', to: 'how' },
          { text: 'Farewell.', to: null, tag: 'leave' },
        ],
      },
      how: { speaker: 'npc:prudence-gannet', text: 'You ask them nicely, and they bring you a fish, and you give them half of it. Same as any partnership. No hoods, no rings on their necks. A bird that’s made to fish brings you the small ones.', next: null },
    },
  },
  {
    id: 'dialogue:hunt-joss', name: 'Joss Amblin (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:joss-amblin', text: 'Pelts bought, pelts sold. No black ones, mind. I’ve standards, and I’ve also seen what happens to people who wear them.', next: null } },
  },
  // ---------- lair codexes (side-room "Old writing", Claude 2's instanceGen): obj:<lair>-codex
  {
    id: 'dialogue:obj-hunt-capital-lair-1-codex', name: 'The Poachers’ Camp: a beater’s armband', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'In a tin under the Chief’s bunk, wrapped in oilcloth: a Barons’ beater’s armband, thirty years old, washed and folded, and a child’s drawing of a deer in charcoal. On the back, in the same child’s hand: “Da, bring a live one home.”', effects: [{ unlockLore: 'lore:hc-poacher-chief' }], next: null } },
  },
  {
    id: 'dialogue:obj-hunt-capital-lair-2-codex', name: 'The Tick Hollows: a Lodge marker stone', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Half sunk in the mud at the bottom of the Hollows, an old Lodge marker stone with the Hunt mark cut into it, and under the mark, in letters worn soft: HERE THE OLD ONES LIE DOWN. HUNT NOTHING.', effects: [{ unlockLore: 'lore:hc-tick-hollows' }], next: null } },
  },
  {
    id: 'dialogue:obj-hunt-capital-lair-3-codex', name: 'The Trophy Hall: the smallest case', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'In the smallest case at the very end of the Hall, below a thousand heads, sits a stuffed hare on a velvet cushion, a little moth-eaten. The brass plate under it reads: “Taken by Corva Ashby, aged seven. Her father says it is a beginning.”', effects: [{ unlockLore: 'lore:hc-corva-first-trophy' }], next: null } },
  },
  {
    id: 'dialogue:obj-hunt-frontier-lair-1-codex', name: 'The Bear Cave: a board at the mouth', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A board nailed up inside the cave mouth, weathered silver, in Mews paint: “OLD BRUIN. Lets the young hawks mob him in summer. Do not shoot. Do not feed. Do not let him at the honey, he will only be sick.” Under it, newer, in charcoal: “Not seen him this spring.”', effects: [{ unlockLore: 'lore:hc-old-bruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-hunt-frontier-lair-2-codex', name: 'The Hollow Eyrie: an old brass ring', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Among the bones on the eyrie’s rim lies a brass ring the size of a bracelet, worn almost smooth, stamped with the Concord crown and no date at all. The Mews ring-book goes back a thousand years. Whoever rang Grandmother Talon rang her before it began.', effects: [{ unlockLore: 'lore:hc-grandmother-talon' }], next: null } },
  },
  {
    id: 'dialogue:obj-hunt-frontier-lair-3-codex', name: 'The Moor’s Crown: a camp in the ring', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'In the lee of the tallest stone, a camp kept very tidy: a bedroll squared at the corners, a hood-maker’s last, and a slate with one line written over and over in a careful hand, until the whole slate is grey with it: “Nothing will be afraid.”', effects: [{ unlockLore: 'lore:hc-moors-crown' }], next: null } },
  },
];

export default dialogues;
