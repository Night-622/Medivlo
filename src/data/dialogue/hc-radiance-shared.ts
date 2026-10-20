/**
 * Hollow Crown, Solaria: scenes both Radiance campaigns share (the Dawn Gate seal, the Abbeyshore diaspora's
 * general talk). Class-specific entries first; the gate is one place reached from both Dawnspire and the March.
 * Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-radiance-gate-seal', name: 'I-10 opening the Dawn Gate', scope: 'party',
    entries: [
      { when: { questStage: 'quest:cantor-the-dawn-gate', stage: 'gate' }, node: 'can' },
      { when: { questStage: 'quest:oathbound-the-dawn-gate', stage: 'gate' }, node: 'oat' },
      { node: 'seal' },
    ],
    nodes: {
      can: {
        speaker: 'narrator', text: 'The Fallen Hierarch kneels in the Dawn Gate with his golden mask in his hands. Under it he is very old, and weeping, and the tears are leaving him clear. He looks up at you and asks, very quietly, for the dark.',
        choices: [
          { text: '(Sing him Compline.)', to: 'compline', when: { insight: 'compline' }, effects: [{ setFlag: 'cantor.hierarch', value: 'compline' }] },
          { text: '(Sing him a lullaby. Any lullaby.)', to: 'lullaby', effects: [{ setFlag: 'cantor.hierarch', value: 'lullaby' }] },
        ],
      },
      compline: { speaker: 'narrator', text: 'You sing the light down, the way the Choir did before he forbade it. At the second verse his eyes close. At the amen he lies down across the foot of the gate like a tired dog across a doorway, and sleeps, for the first time in thirty years.', next: 'can_open' },
      lullaby: { speaker: 'narrator', text: 'You sing the simplest thing you know, a lullaby the novices hum to each other in the dormitory. He knows it. His mouth moves with the words. Then he lies down across the foot of the gate, and sleeps, for the first time in thirty years.', next: 'can_open' },
      can_open: { speaker: 'narrator', text: 'You hold up the Altar half. It sings, and the white stone of the gate answers. As it swings open a thin line of light slides past your shoulder and through the gap ahead of you, quick as a held breath, like someone who has been waiting there a long time.', next: 'through' },
      oat: {
        speaker: 'narrator', text: 'Your lord kneels in the Dawn Gate. The black is running out of him. He takes off his golden mask with both hands, and his voice is an old man’s: I swore to keep the light, knight. Forever. I am so tired. Release me from it.',
        choices: [
          { text: 'I release you, Your Radiance. Your oath is kept.', to: 'release', effects: [{ setFlag: 'oathbound.hierarch', value: 'released' }] },
          { text: '(Kneel, and take the oath from his hands.) Then I’ll keep it a while. You can put it down.', to: 'take', school: 'radiance', effects: [{ setFlag: 'oathbound.hierarch', value: 'taken' }] },
        ],
      },
      release: { speaker: 'narrator', text: 'He breathes out, a long breath, as if he had been holding it since C. 1012. Then he lies down across the foot of the gate with his mask beside him, and sleeps.', next: 'oat_open' },
      take: { speaker: 'narrator', text: 'You take his hands, and something passes between them, warm and heavy. He smiles at you the way an old man smiles at a child who has offered to carry his bag. Then he lies down across the foot of the gate, and sleeps.', next: 'oat_open' },
      oat_open: { speaker: 'narrator', text: 'You hold up the March half. It sings, and the white stone of the gate answers. As it swings open, a grey horse comes past you at a walk, out of nowhere, and goes through first. Its rider raises one gauntlet to you, politely, without looking back.', next: 'through' },
      through: { speaker: 'narrator', text: 'Slowly, for the first time in thirty years, the Dawn Gate opens. Beyond it is a road going down into dusk, the smell of green grass, and somewhere far ahead, a bell.', next: null },
      seal: { speaker: 'narrator', text: 'The Dawn Gate stands open. Across its threshold the Fallen Hierarch sleeps in the light, snoring faintly. Concordia lies beyond.', next: null },
    },
  },
  {
    id: 'dialogue:radiance-ysmay', name: 'Mother Ysmay Penhallow (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ysmay-penhallow', text: 'Come in out of the wind. We sing the hours at that window, towards the lake, every one of them. On a still day you can hear the choir under the water singing back.',
        choices: [
          { text: 'Who are your congregation?', to: 'who' },
          { text: 'Bless you, Mother.', to: 'bless' },
        ],
      },
      who: { speaker: 'npc:ysmay-penhallow', text: 'Pilgrims, mostly, who came to the Abbey for the 85th Turning and were on this side of the arches when they shut. Thirty years we’ve kept a little Dawnspire going on a wet shore. We’re very good at the hours. We’re very bad at the weather.', next: null },
      bless: { speaker: 'npc:ysmay-penhallow', mood: 'happy', text: 'And you, love. It’s free. It’s also very damp.', next: null },
    },
  },
  {
    id: 'dialogue:radiance-shorewatch', name: 'The Shorewatch (general)',
    entries: [
      { when: { flag: 'oathbound.shorewatch' }, node: 'relieved' },
      { node: 'halt' },
    ],
    nodes: {
      halt: { speaker: 'npc:cuthbert-lowe', text: 'HALT. None shall reach the drowned nave while the Shorewatch stands. (A pause, and a long creak.) The Shorewatch is still standing. Mostly. Move along, friend, the lake’s cold and so are we.', next: null },
      relieved: { speaker: 'npc:cuthbert-lowe', mood: 'happy', text: 'Still here, but sitting down. You’d be amazed how much better a lake looks when you’re sitting down beside it. Bryony’s taken up fishing. Petronella can’t hear the fish, so she’s winning.', next: null },
    },
  },
  // ---------- lair codexes (side-room "Old writing", Claude 2's instanceGen): obj:<lair>-codex
  {
    id: 'dialogue:obj-radiance-capital-lair-1-codex', name: 'The Bell Loft: the ringers’ rota', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A ringers’ rota pinned to a beam, twelve names to a column, two to an hour. Since C. 1012 every line of it says the same, in gold leaf, very neatly: THE SERAPH. There is no column for anyone to relieve it.', effects: [{ unlockLore: 'lore:hc-radiance-ringers-rota' }], next: null } },
  },
  {
    id: 'dialogue:obj-radiance-capital-lair-2-codex', name: 'The Reliquary of Hours: the receipt-book', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A receipt-book on a lectern. “One head of the Saint of Noon, very holy, forty gold.” “One head of the Saint of Noon, holier, sixty gold.” Every receipt signed “Honest Crispin”. Filed, in a clerk’s firm hand, under FAITH.', effects: [{ unlockLore: 'lore:hc-radiance-relic-receipts' }], next: null } },
  },
  {
    id: 'dialogue:obj-radiance-capital-lair-3-codex', name: 'The High Altar: the lens-keepers’ log', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'The lens-keepers’ log, six hundred years of it: bright, very bright, clouded, dim. Every entry for thirty years is in one careful hand that is not a lens-keeper’s: “Bright. Keep it bright. L. B.” The last entry is smudged, as if someone had wept on it.', effects: [{ unlockLore: 'lore:hc-radiance-lens-log' }], next: null } },
  },
  {
    id: 'dialogue:obj-radiance-frontier-lair-1-codex', name: 'The Lion’s Gate: the Lion’s wage', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A bronze plate by the gatehouse step: THE LION KEEPS THE ROAD. ONE INGOT AT MIDSUMMER, FROM THE MARSHAL’S HAND. Beneath it, nine hundred years of tally-marks, one for every Midsummer. They stop at C. 1012. There has not been a Midsummer since.', effects: [{ unlockLore: 'lore:hc-radiance-lion-plate' }], next: null } },
  },
  {
    id: 'dialogue:obj-radiance-frontier-lair-2-codex', name: 'The Forsworn Chapel: the pew-ends', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Every pew-end in the chapel is carved with the name of a knight struck from the roll. The newest says SER GALLANT. Under it, in a different, steadier hand, someone has cut three more words, very carefully: WHO WOULD NOT KNEEL.', effects: [{ unlockLore: 'lore:hc-radiance-gallant-pew' }], next: null } },
  },
  {
    id: 'dialogue:obj-radiance-frontier-lair-3-codex', name: 'The Dimming Shrine: the vigil-roll', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'The Shrine’s vigil-roll, a thousand years of knights, one line each. The last true entry: “Ilsabet, C. 1012, before the Turning.” Under it, one line a year for thirty years, the same clear hand: “Ilsabet. Still keeping it.”', effects: [{ unlockLore: 'lore:hc-radiance-shrine-roll' }], next: null } },
  },
];

export default dialogues;
