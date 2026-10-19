/**
 * Hollow Crown, Thunderreach: scenes both Storm campaigns share (the Copper Gate seal, the general talk of the Storm
 * diaspora and informants in Concordia). Class-specific entries first; the gate is one place reached from both the
 * Spirehold and the Heights side. Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-storm-gate-seal', name: 'I-10 opening the Copper Gate', scope: 'party',
    entries: [
      { when: { questStage: 'quest:sparkwright-the-copper-gate', stage: 'gate' }, node: 'sw' },
      { when: { questStage: 'quest:stormlancer-the-copper-gate', stage: 'gate' }, node: 'sl' },
      { node: 'seal' },
    ],
    nodes: {
      sw: {
        speaker: 'narrator', text: 'The last of Volta’s anchor-rods lies smoking in the road. Above the gate, Skyrender beats its wings once, the black rain running out of its feathers, and the storm that has stood over the Copper Gate for a year turns, slowly, and goes home.',
        next: 'sw2',
      },
      sw2: { speaker: 'narrator', text: 'The Copper Gate is a great arch of green-gold copper, carved with all twelve schools’ marks, weeping black tears down its face. A scorched lightning-line runs from the top of it into the dark beyond. You hold up the Tower half. It crackles, and the gate answers.', next: 'through' },
      sl: {
        speaker: 'narrator', text: 'Skyrender lands on the cliff-top above the Copper Gate with you on its back, folds its great wings, and bows its head to your lance. Then it lets you down, very gently, the way a storm lets go of a field, and flies home.',
        next: 'sl2',
      },
      sl2: { speaker: 'narrator', text: 'The Copper Gate is a great arch of green-gold copper, weeping black tears down its face. In the turf at its foot are scorched footprints, running, not stopping. You hold up the Eye half. It is perfectly still in your hand, and the gate answers.', next: 'through' },
      through: { speaker: 'narrator', text: 'Slowly, for the first time in thirty years, the Copper Gate opens. Beyond it is a road, and the smell of wet green grass, and somewhere far ahead, a bell.', next: null },
      seal: { speaker: 'narrator', text: 'The Copper Gate stands open. Concordia lies beyond.', next: null },
    },
  },
  // ---------- the Storm diaspora and informants (general talk)
  {
    id: 'dialogue:storm-prudence', name: 'Prudence Spindle (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:prudence-spindle', text: 'Part six. If you ever find part six, of anything, bring it to me. I will fit it to something. I am past caring what.',
        choices: [{ text: 'What do you think part six is?', to: 'six' }, { text: 'Farewell.', to: null, tag: 'leave' }],
      },
      six: { speaker: 'npc:prudence-spindle', text: 'A switch, I expect. It’s always a switch. Thirty years of beautiful Spire, and nobody ever sent us the bit that turns it on.', next: null },
    },
  },
  {
    id: 'dialogue:storm-clement', name: 'Clement Inchley (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:clement-penhallow', text: 'Ledgers, stamps, the occasional explosion. The Works have been quiet a thousand years, give or take. I liked them quiet. I shall write that down too.', next: null } },
  },
  {
    id: 'dialogue:storm-hamlin', name: 'Hamlin Crake (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hamlin-crake', text: 'Lance up! Goat steady! Goat, I said steady! (The goat is not steady.) Morning, lancer.',
        choices: [{ text: 'How do you charge on a goat?', to: 'goat' }, { text: 'Farewell.', to: null, tag: 'leave' }],
      },
      goat: { speaker: 'npc:hamlin-crake', text: 'Same as a ram, only lower, and the goat decides when. You don’t charge on a goat. You suggest a charge, and the goat considers it.', next: null },
    },
  },
  {
    id: 'dialogue:storm-gudrun', name: 'Gudrun Hailstone (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:gudrun-hailstone', text: 'Avalanche, quarter past three, east face. I log them. Nobody reads the log. Would you like to read the log? Nobody ever wants to read the log.', next: null } },
  },
  // ---------- lair codexes (side-room "Old writing", Claude 2's instanceGen): obj:<lair>-codex
  {
    id: 'dialogue:obj-storm-capital-lair-1-codex', name: 'The Witch’s Belfry: the Coven’s bell-rota', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A bell-rota nailed to the belfry wall, two hundred years of it in a dozen hands. RING FOR THE TALLEST TOWER. NEVER FOR A HOUSE. NEVER ON WASHING DAY. Under the last line, freshly, in black: RING FOR EVERYTHING.', effects: [{ unlockLore: 'lore:hc-storm-belfry-rota' }], next: null } },
  },
  {
    id: 'dialogue:obj-storm-capital-lair-2-codex', name: 'The Grand Patent Vault: the inventor’s note', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A note pinned to a panel of the Engine’s housing, the paper gone brown: “Gone for lunch. Back in five minutes. DO NOT SWITCH OFF. — E. H.” Beneath it, scratched into the metal by something with no hands: STILL HERE. STILL HERE. STILL HERE.', effects: [{ unlockLore: 'lore:hc-storm-mk-twelve' }], next: null } },
  },
  {
    id: 'dialogue:obj-storm-capital-lair-3-codex', name: 'The Tower Crown: a box of receipts', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A tin box on a shelf by the cage, full of receipts from the Patent Office: thirty of them, one a year, for the renewal of the same application. On the back of each, in the same neat hand, the same two words: “For Corin.”', effects: [{ unlockLore: 'lore:hc-storm-volta-receipts' }], next: null } },
  },
  {
    id: 'dialogue:obj-storm-frontier-lair-1-codex', name: 'The Ram King’s Crag: the kings’ tallies', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Cut into the rock at the top of the crag, row on row, notches made by horns: one row for every herd-king, one notch for every winter he kept the herd alive. The last row stops at twenty-nine. The twenty-ninth notch is black, and it was cut very deep.', effects: [{ unlockLore: 'lore:hc-storm-ram-kings' }], next: null } },
  },
  {
    id: 'dialogue:obj-storm-frontier-lair-2-codex', name: 'The Thunderbird Aerie: the pennant nest', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'The bottom of the great nest is woven out of lance-pennants, a thousand years of them, faded to every colour of dusk. The very oldest layer, underneath it all, is a single colour: the plain grey-blue of riders who flew behind the storm instead of in front of it.', effects: [{ unlockLore: 'lore:hc-storm-aerie-pennants' }], next: null } },
  },
  {
    id: 'dialogue:obj-storm-frontier-lair-3-codex', name: 'The Eye of the Storm: the carved stone', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Cut into the bare stone at the very edge of the Eye, in letters older than the clans, two words, worn soft by thirty years of wind going round and round them: STOP HERE.', effects: [{ unlockLore: 'lore:hc-storm-eye-stone' }], next: null } },
  },
];

export default dialogues;
