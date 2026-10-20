/**
 * Hollow Crown, Ironhold: scenes both Iron campaigns share (the Iron Gate seal, the Gilded Engine's anvil after its
 * release, and the general talk of the Iron diaspora in Concordia). Class-specific entries first; the gate is one
 * place reached from Anvilgate and from the Deepworks side. Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-iron-gate-seal', name: 'I-10 opening the Iron Gate', scope: 'party',
    entries: [
      { when: { questStage: 'quest:knight-the-iron-gate', stage: 'gate' }, node: 'kn' },
      { when: { questStage: 'quest:juggernaut-the-iron-gate', stage: 'gate' }, node: 'jg' },
      { node: 'seal' },
    ],
    nodes: {
      kn: { speaker: 'narrator', text: 'The hollow iron has run out of the Colossus’s heart-socket and away into the gate road. It kneels on one knee facing Concordia, head bowed, exactly like a knight waiting to be told to rise. Nobody tells it. Nobody here has the right.', next: 'kn2' },
      kn2: { speaker: 'narrator', text: 'The Iron Gate is a great arch of dark iron-stone, carved with all twelve schools’ marks and weeping black down every one. You hold up the Forge half. It rings like an anvil, and the gate answers.', next: 'through' },
      jg: {
        speaker: 'narrator', text: 'The Iron Colossus lies across the gate road like a felled chimney, the last of the hollow iron draining out of it in a long black trickle, like water out of a flooded shaft being pumped. Every plate is stamped with a Rivet Town shift-mark. It is the biggest thing Rivet Town ever made.',
        choices: [
          { text: 'Break it for scrap. Rivet Town eats for a year.', to: 'scrap', effects: [{ setFlag: 'juggernaut.colossus', value: 'scrap' }] },
          { text: 'Leave it standing. Let them see what the diggers built.', to: 'stand', effects: [{ setFlag: 'juggernaut.colossus', value: 'standing' }] },
        ],
      },
      scrap: { speaker: 'narrator', text: 'You prise off the first plate, your own shift-mark on it, and lay it on the rails for the carts to collect. By morning Rivet Town will be here with every cart it owns. By winter there will be coal in every grate. You hold up the Lode half, and the gate answers.', next: 'through' },
      stand: { speaker: 'narrator', text: 'You get your shoulder under it and heave, and with a groan like the whole Deepworks settling, the Colossus sits up against the gate-cliff and stays there, looking down the road towards Rivet Town. Somebody will carve the names on it. You hold up the Lode half, and the gate answers.', next: 'through' },
      through: { speaker: 'narrator', text: 'Slowly, for the first time in thirty years, the Iron Gate opens. Beyond it is a road, and the smell of green grass, and far ahead, a bell. Behind you, in the dust of the gate road, someone you know slips through the gap at your back.', next: null },
      seal: { speaker: 'narrator', text: 'The Iron Gate stands open. Concordia lies beyond.', next: null },
    },
  },
  {
    id: 'dialogue:obj-iron-engine-anvil', name: 'C-3 the Engine’s last anvil', scope: 'party',
    entries: [
      { when: { all: [{ questStage: 'quest:knight-the-gilded-engine', stage: 'anvil' }, { any: [{ insight: 'berenika_reason' }, { flag: 'knight.colossus_vote', value: 'writ' }] }] }, node: 'berenika' },
      { when: { questStage: 'quest:knight-the-gilded-engine', stage: 'anvil' }, node: 'kn' },
      { when: { questStage: 'quest:juggernaut-the-gilded-engine', stage: 'anvil' }, node: 'jg' },
      { node: 'plain' },
    ],
    nodes: {
      berenika: { speaker: 'narrator', text: 'Under your palm the anvil is warm, and the Engine remembers, the way iron remembers a hammer. The last night. A tired woman in a queen’s plate, carrying the crown down here herself, very late, alone.', next: 'berenika2' },
      berenika2: { speaker: 'narrator', mood: 'sad', text: 'Polish it, she said. It passes to Fist at dawn, and I want it to shine for them. And then, more quietly, to nobody: he cannot hear it, you know. Casimir. He has never heard any of it. I am going to let him hold it for one night.', next: 'kn' },
      kn: {
        speaker: 'narrator', effects: [{ setFlag: 'story.sentinel.iron', value: true }], text: 'The Engine’s last plate cools under your hand. Somewhere inside, a sound like a bell struck under a blanket: I made the settings to hold the grief as well as the song. I did my work. Did they know?',
        choices: [
          { text: 'They know now.', to: 'known' },
          { text: '(Hold the line of its anvil with your shield, as you would a wall.)', to: 'known', school: 'iron' },
        ],
      },
      known: { speaker: 'narrator', text: 'The warmth goes out of the anvil, slowly, the way it goes out of a forge at the end of a long day’s work that went well.', next: null },
      jg: {
        speaker: 'narrator', effects: [{ setFlag: 'story.sentinel.iron', value: true }], text: 'The anvil is warm. From inside the Engine, very faint, a question, the kind a worker asks at the end of a very long shift: I made the settings to hold the schools’ grief as well as their song, so no one had to carry it alone. Nobody ever told me. Was my work good?',
        choices: [
          { text: 'Your work was good.', to: 'good', insight: 'engine_work_good' },
          { text: 'It held. That’s what good work does.', to: 'good' },
          { text: '(Lay down your maul beside the anvil, the way a miner lays down tools at end of shift.)', to: 'tools', school: 'iron' },
        ],
      },
      good: { speaker: 'narrator', mood: 'happy', text: 'Something deep in the iron lets go, all at once, like a held breath. The anvil cools. Somewhere very far away, an end-of-shift whistle seems to blow, though there is no whistle within a hundred miles.', next: null },
      tools: { speaker: 'narrator', text: 'You lay your tools down. The anvil goes quiet beneath your hand, like a worker finally sitting down, and it does not get up again.', next: 'good' },
      plain: { speaker: 'narrator', text: 'The Gilded Engine’s last anvil, plain dark iron under the gold, cold and quiet.', next: null },
    },
  },
  // ---------- the Iron diaspora in Concordia (general talk)
  // ---------- lair codexes (side-room "Old writing", Claude 2's instanceGen): obj:<lair>-codex
  {
    id: 'dialogue:obj-iron-capital-lair-1-codex', name: 'The Barrow of Knights: the vigil-roll', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A vigil-roll by the Barrow stair: every squire who ever knelt here, and the hour they rose. Hundreds of names. Near the bottom, one line in a strong hand has no hour beside it: “Ser Roswitha Dunne. Knelt C. 1012. To rise when the crown comes home.”', effects: [{ unlockLore: 'lore:hc-iron-barrow' }], next: null } },
  },
  {
    id: 'dialogue:obj-iron-capital-lair-2-codex', name: 'The Heraldry Vault: a herald’s note', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A herald’s note pinned to the cellar door: “Scrapings from the shields of the following houses, at their own request.” The list runs down the door and on to the wall and round the corner. At the bottom, in a smaller hand: “What are we to do with them? Nobody will say.”', effects: [{ unlockLore: 'lore:hc-iron-heraldry-vault' }], next: null } },
  },
  {
    id: 'dialogue:obj-iron-capital-lair-3-codex', name: 'The Forge Throne: the regent’s plate', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A brass plate on the back of the Forge Throne, where only a servant cleaning it would see: “Raised C. 1013 over the Forge half, that the Regency may hear the realm being made.” Somebody has scratched under it, with a knife, very small: “I have listened. K.”', effects: [{ unlockLore: 'lore:hc-iron-forge-throne' }], next: null } },
  },
  {
    id: 'dialogue:obj-iron-frontier-lair-1-codex', name: 'The Warden Foundry: the last casting-order', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A casting-order nailed over the moulds, the ink brown with twenty years: “Sentries, for the Colossus, as many as required.” Under it, scratched into the iron of the door with something sharp, over and over, in a hand that is not a hand: “HOW MANY. HOW MANY. HOW MANY.”', effects: [{ unlockLore: 'lore:hc-iron-warden-foundry' }], next: null } },
  },
  {
    id: 'dialogue:obj-iron-frontier-lair-2-codex', name: 'The Scrap Hive: a tin sign', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Deep in the Hive, in a layer of junk older than Rivet Town’s oldest grandmother, a tin sign: “SCRAPFIELDS. TIP HERE. NOTHING IS WASTED.” The Scrap Beetles have eaten everything round it but the words.', effects: [{ unlockLore: 'lore:hc-iron-scrap-hive' }], next: null } },
  },
  {
    id: 'dialogue:obj-iron-frontier-lair-3-codex', name: 'The Hollow Lode: a survey stake', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A surveyor’s stake driven into the deep seam, its tag still legible: “Lode, C. 1013. Iron sings. Very fine. Do NOT dig at night.” Under it, a newer tag, bright tin: “Purchased outright. M. Ruhl. Night shift begins Monday.”', effects: [{ unlockLore: 'lore:hc-iron-hollow-lode' }], next: null } },
  },
  {
    id: 'dialogue:iron-perpetua', name: 'Envoy Perpetua Stannard (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:perpetua-stannard', text: 'The Ironhold embassy is open. It has been open for thirty years. Do sign the visitors’ book; you are the second name in it since C. 1012.', next: null },
    },
  },
  {
    id: 'dialogue:iron-jenks', name: 'Hobnail Jenks (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:hobnail-jenks', text: 'Mind the gold, it’s slippy. And turn your pockets out on the way up, or the Sparkwrights’ll do it for you.', next: null },
    },
  },
];

export default dialogues;
