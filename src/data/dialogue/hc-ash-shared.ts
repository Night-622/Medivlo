/**
 * Hollow Crown, Cinderreach: scenes both Ash campaigns share (the Cinder Gate seal, Forgewife Ada's general
 * talk). Class-specific entries first; the gate is one place reached from both the Kilnhold and the Fields side.
 * Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-ash-gate-seal', name: 'I-10 opening the Cinder Gate', scope: 'party',
    entries: [
      { when: { questStage: 'quest:arcanist-the-cinder-gate', stage: 'gate' }, node: 'arc' },
      { when: { questStage: 'quest:reaver-the-cinder-gate', stage: 'gate' }, node: 'rev' },
      { node: 'seal' },
    ],
    nodes: {
      arc: { speaker: 'narrator', text: 'The Cinder Gate is a great arch of black basalt, carved with all twelve schools’ marks, weeping black tears down its face. You hold up the Kiln half. It sings, and the gate answers.', next: 'through' },
      rev: {
        speaker: 'narrator', text: 'Pyrelord Vulkan lies across the road, the black gone out of its scales. Its eyes are open. It has fought the Muster for a thousand years, and it is waiting to see what you will do.',
        choices: [
          { text: 'Finish it. The war ends here.', to: 'slain', effects: [{ setFlag: 'reaver.vulkan', value: 'slain' }] },
          { text: '(Lower your axe.) Sleep, old enemy.', to: 'sleep', effects: [{ setFlag: 'reaver.vulkan', value: 'sleeping' }] },
        ],
      },
      slain: { speaker: 'narrator', text: 'One stroke. The great fire goes out like a held breath let go. The Fields are very quiet. You hold up the Field half, and the gate answers.', next: 'through' },
      sleep: { speaker: 'narrator', text: 'The Pyrelord puts its head down on its claws, coils once round the foot of the gate, and sleeps, as it slept before the tears. You hold up the Field half, and the gate answers.', next: 'through' },
      through: { speaker: 'narrator', text: 'Slowly, for the first time in thirty years, the Cinder Gate opens. Beyond it is a road, and the smell of green grass, and somewhere far ahead, a bell.', next: null },
      seal: { speaker: 'narrator', text: 'The Cinder Gate stands open. Concordia lies beyond.', next: null },
    },
  },
  {
    id: 'dialogue:ash-ada', name: 'Forgewife Ada (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:forgewife-ada', text: 'Our kiln burns cold. Thirty years cold. Warm yourself anyway; it’s the thought that counts.', next: null } },
  },
  // ---------- lair codexes (side-room "Old writing", Claude 2's instanceGen): obj:<lair>-codex
  {
    id: 'dialogue:obj-ash-capital-lair-1-codex', name: 'The Zealots’ Furnace: the preacher’s sermon book', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A sermon book on a lectern in a side chapel, every page in the same tight hand. The early sermons are about fire as a gift. Then, page by page, the gift becomes a cleansing, and the cleansing becomes a cure, and the last page says only: “If they weep, burn them until they stop.”', effects: [{ unlockLore: 'lore:hc-zealot-sermons' }], next: null } },
  },
  {
    id: 'dialogue:obj-ash-capital-lair-2-codex', name: 'The Glass Archive: an archivist’s index card', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'An index card that slipped behind a shelf before the fire: “Records of the Concord, the Turnings, and the Thirteenth. See: CLOSED STACKS (Provost’s key only).” The closed stacks are ash. Somebody burned that shelf first.', effects: [{ unlockLore: 'lore:hc-glass-archive' }], next: null } },
  },
  {
    id: 'dialogue:obj-ash-capital-lair-3-codex', name: 'The Heart of the Kiln: the first stoker’s mark', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Low on the wall of the Kiln’s heart, below even the stokers’ marks, a single handprint pressed into the brick while it was still soft, a thousand years ago. Beside it, scratched: “For the song. Keep it lit.” The handprint is small. A child’s.', effects: [{ unlockLore: 'lore:hc-kiln-heart' }], next: null } },
  },
  {
    id: 'dialogue:obj-ash-frontier-lair-1-codex', name: 'The Drake Roost: a rider’s saddle', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A Muster riding saddle, centuries old, wedged into the nest-rock where a drake has been using it as a pillow. Burned into the leather: “Ridden by Hesk, who flew with the drakes, before the war.” Before the war, Reavers flew.', effects: [{ unlockLore: 'lore:hc-drake-riders' }], next: null } },
  },
  {
    id: 'dialogue:obj-ash-frontier-lair-2-codex', name: 'The Brand-Pits: a kennel-keeper’s board', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A board nailed over a pit-mouth, the old Muster brand burned into it, and under the brand a list of names: Ember, Ash, Coal, Cinder, Spark. Hound names. Somebody used to keep these pits, and named every whelp.', effects: [{ unlockLore: 'lore:hc-brand-pits' }], next: null } },
  },
  {
    id: 'dialogue:obj-ash-frontier-lair-3-codex', name: 'The Old Battle-Kiln: the war-kiln’s plate', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'An iron plate bolted to the war-kiln’s door: “Battle-Kiln of the Red Muster. Lit for the Schools’ War. To be put out when it is over.” Under it, in a later, angrier hand: “WHEN?”', effects: [{ unlockLore: 'lore:hc-battle-kiln' }], next: null } },
  },
];

export default dialogues;
