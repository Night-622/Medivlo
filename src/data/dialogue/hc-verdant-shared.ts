/**
 * Hollow Crown, Wildheart: scenes both Verdant campaigns share (the Thorn Gate seal, the Verdant bench at the
 * Stone Court for C-6, Teasel Gammon's general talk). Class-specific entries first; the gate is one place reached
 * from Rootholme and from the wilds. Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-verdant-gate-seal', name: 'I-10 opening the Thorn Gate', scope: 'party',
    entries: [
      { when: { all: [{ questStage: 'quest:hedgewitch-the-thorn-gate', stage: 'gate' }, { flag: 'hedgewitch.roots_part' }] }, node: 'hwroots' },
      { when: { questStage: 'quest:hedgewitch-the-thorn-gate', stage: 'gate' }, node: 'hw' },
      { when: { all: [{ questStage: 'quest:ranger-the-thorn-gate', stage: 'gate' }, { flag: 'ranger.holt_walks' }] }, node: 'rgholt' },
      { when: { questStage: 'quest:ranger-the-thorn-gate', stage: 'gate' }, node: 'rg' },
      { node: 'seal' },
    ],
    nodes: {
      hwroots: { speaker: 'narrator', text: 'The last roots round the arch shift as you come near, grumbling, and draw aside like a curtain, because the tree knows your name. Yarrow taught it.', next: 'hw' },
      hw: { speaker: 'narrator', text: 'The Elder Grove lies curled at the foot of the Thorn Gate, asleep, its great knots breathing slow. The arch is green stone wound with briar, weeping black sap down its face. You hold up the Heartwood half. It sings, and the briar answers.', next: 'through' },
      rgholt: { speaker: 'narrator', text: 'Holt Barrow puts his shoulder to the last of the roots and holds them back with both arms, the veins standing out on his neck. “Go on,” he says. “Mind the step. That’s not the joke. I’m just saying, mind the step.”', next: 'rg' },
      rg: { speaker: 'narrator', text: 'The dead roots of the Elder Grove have fallen away and lie in a soft heap of honest leaf-mould. The living ones have let go of the gate. You hold up the Rot half. It sings, low and brown and kind, and the briar answers.', next: 'through' },
      through: { speaker: 'narrator', text: 'Slowly, for the first time in thirty years, the Thorn Gate opens. Beyond it is a road, and green grass, and dusk, and somewhere far ahead a bell. In the leaf-mould by your boots there are footprints that are not yours, going on ahead.', next: null },
      seal: { speaker: 'narrator', text: 'The Thorn Gate stands open. Concordia lies beyond.', next: null },
    },
  },
  {
    id: 'dialogue:obj-verdant-court-bench', name: 'C-6 the Verdant bench at the Stone Court', scope: 'party',
    entries: [
      { when: { all: [{ questStage: 'quest:hedgewitch-a-letter-from-yarrow', stage: 'court' }, { partyHasClass: 'ranger' }] }, node: 'hwparty' },
      { when: { questStage: 'quest:hedgewitch-a-letter-from-yarrow', stage: 'court' }, node: 'hw' },
      { when: { all: [{ questStage: 'quest:ranger-holts-blaze', stage: 'court' }, { partyHasClass: 'hedgewitch' }] }, node: 'rgparty' },
      { when: { questStage: 'quest:ranger-holts-blaze', stage: 'court' }, node: 'rg' },
      { node: 'bench' },
    ],
    nodes: {
      hw: {
        speaker: 'npc:bearer-ranger', text: 'Sit down, witch, you’re making the moss nervous. Rowan. You know that. You smell of sap, by the way. All Rootholme folk do. Like a pudding.',
        choices: [
          { text: 'You smell of leaf-mould.', to: 'mould' },
          { text: '(Sit, and let the halves sing.)', to: 'sing' },
        ],
      },
      mould: { speaker: 'npc:bearer-ranger', text: 'Thank you. It’s honest. Unlike your compost. Rootholme compost is a heap of cabbage that’s been told off.', next: 'compost' },
      compost: {
        speaker: 'npc:bearer-ranger', text: 'Out in the wilds we let things rot where they fall. None of this turning it on a Tuesday.',
        choices: [
          { text: 'Turned compost is faster.', to: 'sing' },
          { text: 'Our compost hasn’t rotted in thirty years. Neither has yours.', to: 'true', school: 'verdant' },
        ],
      },
      true: { speaker: 'npc:bearer-ranger', mood: 'sad', text: '(A long pause.) No. It hasn’t. Not since the crown broke. All right. Let’s not argue about compost. Let’s argue about compost when there’s some.', next: 'sing' },
      sing: { speaker: 'narrator', text: 'You sit on the old Verdant bench, Heartwood half and Rot half side by side. They hum, and then they sing together: growth and rot, the two ends of one thing, in tune for the first time in thirty years. Moss comes up green between the paving stones.', next: 'end' },
      end: { speaker: 'npc:bearer-ranger', text: 'Huh. That’s the first nice sound I’ve heard since the Thornwilds. Don’t lose your half, witch. I’d have to come and find it, and I hate towns.', next: null },
      hwparty: { speaker: 'narrator', text: 'You and the Ranger sit on the old Verdant bench at the Stone Court, Heartwood half and Rot half side by side. The halves hum, then sing together, growth and rot in tune. You argue about compost for a quarter of an hour, and neither of you wins, and it is the best quarter of an hour in weeks.', next: null },
      rg: {
        speaker: 'npc:bearer-hedgewitch', text: 'There you are. Bryony. Sit down, you’ll frighten the moss. You smell of leaf-mould, did you know? Like the bottom of a wet basket.',
        choices: [
          { text: 'You smell of sap. Like a pudding.', to: 'pudding' },
          { text: '(Sit, and let the halves sing.)', to: 'rgsing' },
        ],
      },
      pudding: { speaker: 'npc:bearer-hedgewitch', text: 'I will take that as a compliment, because I am a very good pudding. Now tell me you don’t let your compost rot where it falls.', next: 'rgcompost' },
      rgcompost: {
        speaker: 'npc:bearer-hedgewitch', text: 'Rootholme compost is turned every Tuesday, and it’s a science.',
        choices: [
          { text: 'It’s a heap of cabbage that’s been told off.', to: 'rgsing' },
          { text: 'Neither of our heaps has rotted in thirty years.', to: 'rgtrue', school: 'verdant' },
        ],
      },
      rgtrue: { speaker: 'npc:bearer-hedgewitch', mood: 'sad', text: '(Quietly.) No. They haven’t. Mother Yarrow says the tree is too tired to rot. All right. Truce. We’ll argue about it when there’s compost again.', next: 'rgsing' },
      rgsing: { speaker: 'narrator', text: 'You sit on the old Verdant bench, Rot half and Heartwood half side by side. They hum, and then they sing together: rot and growth, the two ends of one thing, in tune for the first time in thirty years. Moss comes up green between the paving stones.', next: 'rgend' },
      rgend: { speaker: 'npc:bearer-hedgewitch', text: 'Oh, that’s lovely. That’s what the tree sounds like when it’s happy. Keep your half safe, Ranger. Don’t make me come out into the mud after it.', next: null },
      rgparty: { speaker: 'narrator', text: 'You and the Hedgewitch sit on the old Verdant bench at the Stone Court, Rot half and Heartwood half side by side. The halves hum, then sing together, rot and growth in tune. You argue about compost for a quarter of an hour, and neither of you wins, and it is the best quarter of an hour in weeks.', next: null },
      bench: { speaker: 'narrator', text: 'The old Verdant bench at the Stone Court. Moss has come up green between the paving stones around it.', next: null },
    },
  },
  // ---------- lair codexes (side-room "Old writing", Claude 2's instanceGen): obj:<lair>-codex
  {
    id: 'dialogue:obj-verdant-capital-lair-1-codex', name: 'The Spore Cellar: the growers’ notice', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A painted board on the inside of the cellar door, flaking: “SPORE CELLAR. Mushrooms for the Circle’s winter stores. KEEP THIS DOOR SHUT, or the whole street will have a nap.” Somebody, much later, has added underneath in charcoal: “not funny any more”.', effects: [{ unlockLore: 'lore:hc-verdant-spore-cellar' }], next: null } },
  },
  {
    id: 'dialogue:obj-verdant-capital-lair-2-codex', name: 'The Seed Vault: the Gardener’s plinth', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A small brass plate on an empty plinth by the vault door, green with age: “THE GARDENER. Clipped and quickened by N. Briar, to keep the vault tidy while I am away at the Turning. Be good. Back in the spring.” The plinth is worn smooth on top, where something stood for a very long time, waiting.', effects: [{ unlockLore: 'lore:hc-verdant-seed-vault' }], next: null } },
  },
  {
    id: 'dialogue:obj-verdant-capital-lair-3-codex', name: 'The Heartwood: the first witches’ rule', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Over a low door into the living wood, carved so long ago the letters have grown fat and soft with the bark: “SPEAK SOFTLY. IT IS LISTENING.” Below it, very faint, a hundred hands have rubbed the same spot smooth, the way people touch a doorframe for luck.', effects: [{ unlockLore: 'lore:hc-verdant-heartwood' }], next: null } },
  },
  {
    id: 'dialogue:obj-verdant-frontier-lair-1-codex', name: 'The Mossback Wallow: the swineherd’s post', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A post at the edge of the Wallow, carved with names: BRAMBLE. OLD GREY. TUFFET. DUCHESS OF THE MUD. Mossback names, and beside each a notch for every litter. Under the last name someone has cut, small and sorry: “let them go”.', effects: [{ unlockLore: 'lore:hc-verdant-mossback-wallow' }], next: null } },
  },
  {
    id: 'dialogue:obj-verdant-frontier-lair-2-codex', name: 'The Beetle Mound: the tally-pole', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A Wayfarer tally-pole, half swallowed by black lacquer, notched for the Mound’s clutches every spring: forty, forty-two, thirty-nine. The last notches, thirty years old, run off the end of the pole and down on to the floor, and stop beside the word “WHY”.', effects: [{ unlockLore: 'lore:hc-verdant-beetle-mound' }], next: null } },
  },
  {
    id: 'dialogue:obj-verdant-frontier-lair-3-codex', name: 'The Rotting Glade: the Kitchen stones', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A ring of old stones in the leaf-mould, worn smooth, with one word cut into the biggest: KITCHEN. Somebody has left a wooden spoon on it, very old, as if for luck. The spoon has not rotted. Nothing in the glade has rotted for thirty years.', effects: [{ unlockLore: 'lore:hc-verdant-rotting-glade' }], next: null } },
  },
  {
    id: 'dialogue:verdant-teasel', name: 'Teasel Gammon (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:teasel-gammon', text: 'Mind the seedlings. Thirty years we’ve kept Wildheart going in pots. Pots! Like geraniums.',
        choices: [
          { text: 'What was the Hedge House?', to: 'house' },
          { text: 'Farewell.', to: null, tag: 'leave' },
        ],
      },
      house: { speaker: 'npc:teasel-gammon', text: 'A waystation, for the Wayfarers and the Circle both, when the Turning came through Concordia. Rangers slept upstairs and witches slept down, and they argued about compost through the floor. I miss it.', next: null },
    },
  },
];

export default dialogues;
