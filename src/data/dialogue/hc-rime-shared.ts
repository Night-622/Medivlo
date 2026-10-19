/**
 * Hollow Crown, Frostmere: scenes both Rime campaigns share (the White Gate seal, the general talk of the Rime
 * diaspora in Concordia). Class-specific entries first; the gate is one place reached from both the Glacierhome and
 * the Wardwall side. Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-rime-gate-seal', name: 'I-10 opening the White Gate', scope: 'party',
    entries: [
      { when: { questStage: 'quest:rimecaller-the-white-gate', stage: 'gate' }, node: 'rc' },
      { when: { questStage: 'quest:warden-the-white-gate', stage: 'gate' }, node: 'wd' },
      { node: 'seal' },
    ],
    nodes: {
      rc: {
        speaker: 'narrator', text: 'The Winter Tyrant sits in the snow beside the road with its hands on its knees, the black icicles fallen from its crown, like an old man at the end of a long shift. The last line of the Archive’s charge is still glowing on its chest: “Hold the cold, and let the travellers through.”',
        next: 'rc2',
      },
      rc2: { speaker: 'narrator', text: 'The White Gate is a great arch of blue ice, carved with all twelve schools’ marks, weeping black tears down its face. Sledge-runners have scored the snow at its foot. You hold up the Spire half. It sings, and the gate answers.', next: 'through' },
      wd: {
        speaker: 'narrator', text: 'The Winter Tyrant kneels in the road, the black gone out of its breath, waiting. It is the Archive’s creature. It has never once taken an order from a Warden. It is waiting for one now.',
        choices: [
          { text: 'Go north. Hold the winter off the Wardwall, the way you were built to.', to: 'wall', effects: [{ setFlag: 'warden.tyrant', value: 'wall' }] },
          { text: 'Lie down. Melt. Let the Jarlsfell have a spring.', to: 'melt', effects: [{ setFlag: 'warden.tyrant', value: 'melt' }] },
        ],
      },
      wall: { speaker: 'narrator', text: 'The Tyrant rises, turns, and walks north up the road with the blizzard folding itself round it like a cloak. Somewhere up on the Wardwall, tonight, the watch-fires will not go out. You hold up the Wall half, and the gate answers.', next: 'through' },
      melt: { speaker: 'narrator', text: 'The Tyrant lies down across the road and lets go. It goes to water from the crown down, slowly, steaming, and the water runs north, downhill, towards the Jarlsfell. You hold up the Wall half, and the gate answers.', next: 'through' },
      through: { speaker: 'narrator', text: 'Slowly, for the first time in thirty years, the White Gate opens. Beyond it is a road, and green grass going grey in the dusk, and somewhere far ahead, a bell.', next: null },
      seal: { speaker: 'narrator', text: 'The White Gate stands open. Concordia lies beyond.', next: null },
    },
  },
  // ---------- the Rime diaspora (general talk)
  {
    id: 'dialogue:rime-mina', name: 'Mina Snell (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:mina-snell', text: 'I remember the day the arches shut exactly. It was a Tuesday. Ingeborg says it was a Thursday. Ingeborg is wrong, but she’s louder.',
        choices: [{ text: 'What else do you remember?', to: 'else' }, { text: 'Farewell.', to: null, tag: 'leave' }],
      },
      else: { speaker: 'npc:mina-snell', text: 'Everything. The price of herring in C. 1009. The colour of the Regent’s wedding gloves. The name of every cat in Glacierhome. We kept no archive here, so I am the archive. It is exhausting, and I love it.', next: null },
    },
  },
  {
    id: 'dialogue:rime-ingeborg', name: 'Ingeborg Tull (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ingeborg-tull', text: 'Drill at dawn, drill at dusk. Thirty years. The gate faces north, and nothing comes. We drill anyway.',
        choices: [{ text: 'Why, if nothing comes?', to: 'why' }, { text: 'Farewell.', to: null, tag: 'leave' }],
      },
      why: { speaker: 'npc:ingeborg-tull', text: 'Because a gate isn’t for the day nothing comes. It’s for the one day something does. And because if we stopped, we’d have to admit we were only a village.', next: null },
    },
  },
  {
    id: 'dialogue:rime-hepsie', name: 'Hepsie Fenny (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hepsie-fenny', text: 'Lanterns for the marsh. Honest ones. Oil and wick and a good glass. They only lead you where you’re already going.',
        choices: [{ text: 'And the lights off the water?', to: 'water' }, { text: 'Farewell.', to: null, tag: 'leave' }],
      },
      water: { speaker: 'npc:hepsie-fenny', text: 'Somebody’s held moment, in a jar, sold by the Queen. They lead you wherever the moment wants to go, and the moment always wants to go back. Don’t buy one. Not ever. Not even a pretty one.', next: null },
    },
  },
  // ---------- lair codexes (side-room "Old writing", Claude 2's instanceGen): obj:<lair>-codex
  {
    id: 'dialogue:obj-rime-capital-lair-1-codex', name: 'The Melt Cisterns: the keepers’ duty board', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A slate on a nail by the sluice: the keepers’ duty board. Four names, a rota, and a column headed SUPPER, where every Friday says STEW. Every line for thirty years says Friday. Under the last one, in chalk: “Nobody has complained.”', effects: [{ unlockLore: 'lore:hc-rime-cistern-board' }], next: null } },
  },
  {
    id: 'dialogue:obj-rime-capital-lair-2-codex', name: 'The Mirror Gallery: the gallery plaque', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A plaque in the Archive’s best lettering: “THE MIRROR GALLERY. These mirrors keep the last face that looked into them. Please look your best.” Underneath, smaller, added later: “Please do not look into them on a bad day. They keep that too.”', effects: [{ unlockLore: 'lore:hc-rime-mirror-gallery' }], next: null } },
  },
  {
    id: 'dialogue:obj-rime-capital-lair-3-codex', name: 'The Crown of the Spire: the Regent’s notebook', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A small notebook on the sill, in a tall grey hand: one column of numbers running from one to ten thousand nine hundred and fifty, and beside every one the same word: Held. Beside the last, the word has been written, crossed out and written again. It says: Tired.', effects: [{ unlockLore: 'lore:hc-rime-regents-count' }], next: null } },
  },
  {
    id: 'dialogue:obj-rime-frontier-lair-1-codex', name: 'The Jarl’s Longhall: the high seat', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Cut into the arm of the high seat, worn smooth by a hundred Jarls’ elbows: THE JARL EATS LAST. On the table below it stand thirty bowls in a row, one for every evening since he froze, each one full, each one frozen solid, not one of them touched.', effects: [{ unlockLore: 'lore:hc-rime-jarl-seat' }], next: null } },
  },
  {
    id: 'dialogue:obj-rime-frontier-lair-2-codex', name: 'The Wraith Barrows: the founders’ roll', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A slab of grey stone in a side barrow: ninety-nine names cut in ninety-nine hands, some neat, some barely letters. At the foot, in the square hand from the charter, the Hundredth Warden’s, and under it a line he began and never finished: “I built it for”.', effects: [{ unlockLore: 'lore:hc-rime-founders-roll' }], next: null } },
  },
  {
    id: 'dialogue:obj-rime-frontier-lair-3-codex', name: 'The Breach: the names in the ice', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Scratched into the ice on the inside of the Breach, in a big careful hand: names. Two hundred and twelve clan names, the ones who came through last winter. The last name on the list is TORVALD. It has been scratched out, hard, and written in again underneath.', effects: [{ unlockLore: 'lore:hc-rime-breach-names' }], next: null } },
  },
];

export default dialogues;
