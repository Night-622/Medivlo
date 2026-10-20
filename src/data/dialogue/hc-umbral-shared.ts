/**
 * Hollow Crown, Nocturne: scenes both Umbral campaigns share (the Dusk Gate seal, and the general talk of the Umbral
 * folk in Concordia: Tabitha Cresset at Lanternford, Constance Gentle at the Drowned Rat). Class-specific entries
 * first; the gate is one place reached from both Duskmere and the warrens. Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-umbral-gate-seal', name: 'I-10 opening the Dusk Gate', scope: 'party',
    entries: [
      { when: { questStage: 'quest:duskweaver-the-dusk-gate', stage: 'gate' }, node: 'dus' },
      { when: { questStage: 'quest:shade-the-dusk-gate', stage: 'gate' }, node: 'sha' },
      { node: 'seal' },
    ],
    nodes: {
      dus: {
        speaker: 'narrator', text: 'The Eclipse Queen lies across the gate-step with the moon slid back up out of her into the sky. The black disc of her eclipse has drained away, and under it she is only an old woman in a crown of night, frowning, as if trying to remember a word.',
        choices: [
          { text: '(Weave her the memory of her own name.)', to: 'name', school: 'umbral', effects: [{ setFlag: 'duskweaver.queen', value: 'named' }] },
          { text: 'Sleep, Majesty. It’ll keep.', to: 'sleep', effects: [{ setFlag: 'duskweaver.queen', value: 'slept' }] },
        ],
      },
      name: { speaker: 'narrator', text: 'You find it at the bottom of Nocturne’s oldest memory of the moon, where she left it: a short, plain name, the kind somebody calls up the stairs. She hears it, and her face clears, and she says it once, aloud, wonderingly, and then she sleeps.', next: 'dus_open' },
      sleep: { speaker: 'narrator', text: 'She does. With the moon back in the sky she has nothing left to swallow, and she curls up on the gate-step like a cat on a warm hearth, and sleeps, and for the first time since the Bell, Nocturne’s moon does not ripple.', next: 'dus_open' },
      dus_open: { speaker: 'narrator', text: 'You hold up the Obelisk half. It sings, and the violet stone of the gate answers. As it swings open, a slim figure in a Keeper’s coat steps past you out of nowhere with a dolls’ house under one arm, and goes through first, and holds the gate for you, politely, before he walks on.', next: 'through' },
      sha: {
        speaker: 'narrator', text: 'The moon has slid back up out of the Eclipse Queen into the sky, and there is light enough in Nocturne, for the first time in thirty years, for every stone and post and blade of grass to cast a shadow. Everything on the road has one. Except you.',
        choices: [
          { text: '(Look down at the empty ground at your feet.)', to: 'look' },
          { text: '(Look down at Mab’s little shadow.)', to: 'mab', when: { flag: 'shade.mab_shadow' } },
        ],
      },
      look: { speaker: 'narrator', text: 'Nothing. A clean patch of moonlight in the shape of nobody. The Queen, sleepy on the gate-step, opens one eye and looks at it, and says, very quietly, “Oh. You too.” Then she sleeps.', next: 'sha_open' },
      mab: { speaker: 'narrator', text: 'Mab’s shadow has climbed down out of your hood and is standing at your heels, very small, very cross, being your shadow as hard as it can. The Queen, sleepy on the gate-step, looks at it and laughs, and sleeps.', next: 'sha_open' },
      sha_open: { speaker: 'narrator', text: 'You hold up the Veil half. It sings, and the violet stone of the gate answers. As it swings open, the moonlight on the gate-step throws one shadow too many: tall, hooded, the shape of you. It goes through the gap ahead of you, flat along the ground, the way shadows go, and is gone.', next: 'through' },
      through: { speaker: 'narrator', text: 'Slowly, for the first time in thirty years, the Dusk Gate opens. Beyond it is a road going down into an ordinary evening, the smell of green grass, and somewhere far ahead, a bell.', next: null },
      seal: { speaker: 'narrator', text: 'The Dusk Gate stands open, with the Eclipse Queen asleep across its step under an ordinary moon. Concordia lies beyond.', next: null },
    },
  },
  {
    id: 'dialogue:umbral-hester', name: 'Tabitha Cresset (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hester-marchbank', text: 'Lanterns for the marsh road, love. Buy one of mine and you won’t follow any of hers. Two shards, and I’ll trim the wick.',
        choices: [
          { text: 'Hers?', to: 'hers' },
          { text: 'You sound like Duskmere.', to: 'dusk' },
        ],
      },
      hers: { speaker: 'npc:hester-marchbank', text: 'The Lantern Queen’s, out on the black water. Hers are prettier. Hers are free. Hers take you somewhere you don’t come back from. Mine take you to Gildport. Your choice.', next: null },
      dusk: { speaker: 'npc:hester-marchbank', mood: 'happy', text: 'My gran was a Keeper. Came over for the 85th Turning and never went back. She taught me to make a lantern that throws a proper shadow. People forget how much they need one.', next: null },
    },
  },
  {
    id: 'dialogue:umbral-constance', name: 'Constance Gentle (general)',
    entries: [
      { when: { all: [{ heroClass: 'duskweaver' }, { flag: 'duskweaver.mourners', value: 'released' }, { not: { flag: 'duskweaver.rat_shortcut' } }] }, node: 'owe' },
      { node: 'start' },
    ],
    nodes: {
      owe: { speaker: 'npc:constance-gentle', text: 'A Keeper. The one who gave the Veil the mourners’ griefs to drown, instead of locking them up. Word travels. We owe you, Keeper, and the Rat pays its debts. There’s a cellar under the Gloamwood road that comes up behind Stag’s Rest. Mind the step.', effects: [{ setFlag: 'duskweaver.rat_shortcut', value: true }], next: null },
      start: {
        speaker: 'npc:constance-gentle', text: 'Back room’s for family, traveller. Front room’s for drinking. The Rat doesn’t ask what you’re carrying, and you don’t ask why the cards are marked.',
        choices: [
          { text: 'Why are the cards marked?', to: 'cards' },
          { text: 'I’ll stay in the front room.', to: 'front' },
        ],
      },
      cards: { speaker: 'npc:constance-gentle', mood: 'happy', text: 'Everybody knows they’re marked. It saves a great deal of time. Now you know too. That’ll be a copper.', next: null },
      front: { speaker: 'npc:constance-gentle', text: 'Wise. The front room’s got the fire. Mind your purse; my cousins practise.', next: null },
    },
  },
  // ---------- lair codexes (side-room "Old writing", Claude 2's instanceGen): obj:<lair>-codex
  {
    id: 'dialogue:obj-umbral-capital-lair-1-codex', name: 'The Cult’s undercroft: the price-list', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A florist’s chalkboard propped on an altar: “Courage, 90. First kiss, 40. Mother’s voice, 12.” At the very bottom, smaller: “Grief: will take for free.” Somebody has rubbed out “take” and written “give”, and then rubbed that out too.', effects: [{ unlockLore: 'lore:hc-umbral-cult-prices' }], next: null } },
  },
  {
    id: 'dialogue:obj-umbral-capital-lair-2-codex', name: 'The Hall of Lost Names: the paper-hangers’ rota', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A rota pinned by the Hall door: which Keeper reads which wall of names aloud, each evening, so every name is said once a year. For thirty years half the slots have been empty. Against the east wall, every slot says the same: O. V. In the margin, very small: “I read them all. Every one. Twice.”', effects: [{ unlockLore: 'lore:hc-umbral-paper-rota' }], next: null } },
  },
  {
    id: 'dialogue:obj-umbral-capital-lair-3-codex', name: 'The Obelisk’s Shadow: the first phial', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A single glass phial fallen in the dark, older than the rest, labelled in a boy’s careful hand: “Mother’s face. Found in the queue. Original. Not to be returned.” It smells, very faintly, of lilac.', effects: [{ unlockLore: 'lore:hc-umbral-first-phial' }], next: null } },
  },
  {
    id: 'dialogue:obj-umbral-frontier-lair-1-codex', name: 'The Stalker’s Den: the lantern-tithe', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A heap of old horn lanterns at the back of the den, dozens of them, crushed flat, each with a fold-mark burned into its base. Scratched on a flat stone among them: “One lantern a moonless night, and it takes the lantern’s shadow and not the ewe’s. Tallow fold paid last. Nobody paid after.”', effects: [{ unlockLore: 'lore:hc-umbral-lantern-tithe' }], next: null } },
  },
  {
    id: 'dialogue:obj-umbral-frontier-lair-2-codex', name: 'The Brood Spire: the cutters’ rule-slate', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A cutters’ slate wedged in the silk halfway up the Spire, the writing worn but cut deep: “One. Hang a bell at every turn. Two. Ring it as you pass. Three. If the bells stop answering, come down. Four. Nobody goes up for anybody. Four is the hardest. Four is why we are still here.”', effects: [{ unlockLore: 'lore:hc-umbral-rule-slate' }], next: null } },
  },
  {
    id: 'dialogue:obj-umbral-frontier-lair-3-codex', name: 'The Veil Heart: the hands on the wall', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'On the wall of the Veil Heart, in lamp-black, a row of hand-prints, every Thief-mother since the first, each with a name under it except the first. The last is very small. Under it, the newest paint: MAB. Above them all, the Veil’s oath: WHAT WE LIFT, WE KEEP SAFE. WHAT WE KEEP, WE GIVE BACK WARM.', effects: [{ unlockLore: 'lore:hc-umbral-veil-oath' }], next: null } },
  },
];

export default dialogues;
