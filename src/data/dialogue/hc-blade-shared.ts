/**
 * Hollow Crown, Steelvale: scenes both Blade campaigns share (the Edge Gate seal, the Blade bench at the Stone
 * Court for C-6, and the general talk of the Blade folk of Brindlecross). Class-specific entries first; the gate is
 * one place reached from Edgewater and from the Terraces. Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-blade-gate-seal', name: 'I-10 opening the Edge Gate', scope: 'party',
    entries: [
      { when: { questStage: 'quest:swordsman-the-edge-gate', stage: 'gate' }, node: 'sw' },
      { when: { questStage: 'quest:samurai-the-edge-gate', stage: 'gate' }, node: 'sa' },
      { node: 'seal' },
    ],
    nodes: {
      sw: {
        speaker: 'narrator', text: 'The Thousand-Edge General stands in the road with empty hands. Around him, in rings on the grass, lie a thousand swords, every one of them dropped, and every one of them staying dropped, which is new to Steelvale. He looks at you, and waits.',
        choices: [
          { text: '(Give him the closing salute.)', to: 'swsalute', effects: [{ setFlag: 'swordsman.general', value: 'saluted' }] },
          { text: '(Lower your own sword, point to the ground.)', to: 'swdown', effects: [{ setFlag: 'swordsman.general', value: 'down' }] },
        ],
      },
      swsalute: { speaker: 'narrator', text: 'You salute, blade up, blade down: the end of a bout. The General has not seen it given in thirty years. Slowly, with an old soldier’s stiffness, he returns it with an empty hand, and sits down in the silver grass among his swords.', next: 'swgate' },
      swdown: { speaker: 'narrator', text: 'You lower your point to the grass. Both swords down. The General looks at your blade, and at his empty hands, and something in his face lets go. He kneels among his thousand swords, and stays there.', next: 'swgate' },
      swgate: { speaker: 'narrator', text: 'The Edge Gate is a great arch of pale stone, edges still sharp after a thousand years, weeping black down every one. You hold up the Hall half. It rings like a struck blade, and the gate answers.', next: 'swthrough' },
      swthrough: { speaker: 'narrator', text: 'Slowly, for the first time in thirty years, the Edge Gate opens. Beyond it is a road, and dusk, and somewhere far ahead a bell. And very faintly, from somewhere beyond the arch, a cheerful voice calls back over its shoulder: “Again!”', next: null },
      sa: { speaker: 'narrator', text: 'The Thousand-Edge General has laid his edges down in the road, one by one, and knelt among them. The novices of Hushpine stand in silence along the road behind you. Nobody speaks. Nobody needs to.', next: 'sagate' },
      sagate: { speaker: 'narrator', text: 'The Edge Gate is a great arch of pale stone, edges still sharp after a thousand years, weeping black down every one. You hold up the Terrace half. Its song is the only sound on the mountain, and the gate answers it.', next: 'sathrough' },
      sathrough: { speaker: 'narrator', text: 'Slowly, for the first time in thirty years, the Edge Gate opens. Beyond it is a road, and dusk, and somewhere far ahead a bell. In the dust of the road through the arch, someone has walked ahead of you, with a bare sword-point trailing beside his footprints.', next: null },
      seal: { speaker: 'narrator', text: 'The Edge Gate stands open. Concordia lies beyond.', next: null },
    },
  },
  {
    id: 'dialogue:obj-blade-court-bench', name: 'C-6 the Blade bench at the Stone Court', scope: 'party',
    entries: [
      { when: { all: [{ questStage: 'quest:swordsman-a-letter-from-ferro', stage: 'court' }, { partyHasClass: 'samurai' }] }, node: 'swparty' },
      { when: { questStage: 'quest:swordsman-a-letter-from-ferro', stage: 'court' }, node: 'sw' },
      { when: { all: [{ questStage: 'quest:samurai-kanemoris-word', stage: 'court' }, { partyHasClass: 'swordsman' }] }, node: 'saparty' },
      { when: { questStage: 'quest:samurai-kanemoris-word', stage: 'court' }, node: 'sa' },
      { node: 'bench' },
    ],
    nodes: {
      sw: { speaker: 'narrator', text: 'On the old Blade bench at the Stone Court sits Aiko Hoshida, the Samurai bearer, straw hat on her knee, perfectly still. She looks at you. She moves over. She says nothing at all.', next: 'swtalk' },
      swtalk: {
        speaker: 'narrator', text: 'You sit. The silence goes on. It goes on for some time.',
        choices: [
          { text: 'So. Hushpine. Is it true you don’t talk for a whole year? What if you stub your toe? What if there’s a fire? Do you sign “fire”? Is there a sign for “fire”?', to: 'swmore' },
          { text: '(Say nothing. Try very, very hard.)', to: 'swtry' },
        ],
      },
      swmore: { speaker: 'narrator', text: 'You talk for a quarter of an hour without stopping: the Ladder, the Saint, Percy’s pin, the Stormcrow, the exact length of Ferro’s letter. Aiko listens to every word. At the end she raises one hand, and makes a small sign: a flame. Then she smiles.', next: 'swsing' },
      swtry: { speaker: 'narrator', text: 'You manage nearly a minute. Then you tell her about the Ladder, and the Saint, and Percy’s pin, and the Stormcrow, and you cannot stop. She listens to every word, and at the end she nods, as if you have told her something important.', next: 'swsing' },
      swsing: { speaker: 'narrator', text: 'Then the halves sing: the Hall half and the Terrace half, side by side on the old Blade bench, the edge and the sheath, in tune for the first time in thirty years. Every blade on the Stone Court hums with them, and goes quiet.', next: null },
      swparty: { speaker: 'narrator', text: 'You and the Samurai sit on the old Blade bench at the Stone Court. You talk for a quarter of an hour; they say nothing at all. Then the Hall half and the Terrace half sing together, the edge and the sheath, and every blade on the Stone Court hums with them, and goes quiet.', next: null },
      sa: {
        speaker: 'npc:bearer-swordsman', text: 'There you are! Gaspard Lisle, Edgewater, rung 37, well, rung 37 before I came through. Sit, sit. You’re Hushpine, aren’t you, the hat gives it away, is it true you don’t talk for a whole year? Don’t answer that. I’ll talk. I’m good at it.',
        choices: [
          { text: '(Say nothing. Sit.)', to: 'satalk' },
          { text: '(Raise one finger to your lips.)', to: 'safinger' },
        ],
      },
      satalk: { speaker: 'npc:bearer-swordsman', text: 'Right, so, the Ladder. Where do I start with the Ladder. (He starts with the Ladder. He goes on to the duel-graves, his maestra, a tailor called Percy, and the right way to eat an orange. You listen to all of it.)', next: 'sasing' },
      safinger: { speaker: 'npc:bearer-swordsman', text: '(He stops, mid-word.) Ah. Yes. Sorry. (He lasts nearly twenty breaths, which is clearly a personal record, and then he tells you about the Ladder anyway, much more quietly.)', next: 'sasing' },
      sasing: { speaker: 'narrator', text: 'Then the halves sing: the Terrace half and the Hall half, side by side on the old Blade bench, the sheath and the edge, in tune for the first time in thirty years. Gaspard stops talking. Every blade on the Stone Court hums with them, and goes quiet.', next: 'saend' },
      saend: { speaker: 'npc:bearer-swordsman', mood: 'happy', text: '(Very softly, for him.) Oh. Well. That’s… I haven’t got anything to say to that. First time for everything.', next: null },
      saparty: { speaker: 'narrator', text: 'You and the Swordsman sit on the old Blade bench at the Stone Court. They talk for a quarter of an hour; you say nothing at all, and listen to every word. Then the Terrace half and the Hall half sing together, the sheath and the edge, and every blade on the Stone Court hums with them, and goes quiet.', next: null },
      bench: { speaker: 'narrator', text: 'The old Blade bench at the Stone Court, worn smooth by a thousand years of duellists waiting their turn.', next: null },
    },
  },
  // ---------- lair codexes (side-room "Old writing", Claude 2's instanceGen): obj:<lair>-codex
  {
    id: 'dialogue:obj-blade-capital-lair-1-codex', name: 'The Saint’s Tomb: the dedication', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Carved over a low side door, in letters worn soft by nine hundred years of challengers’ hands: “HERE LIES THE SAINT OF THE LISTS. COME DOWN AND FENCE HIM. SALUTE HIM AT THE END. HE WILL WAIT.” The last line has been scratched at, as if someone tried to cross it out.', effects: [{ unlockLore: 'lore:hc-blade-saints-tomb' }], next: null } },
  },
  {
    id: 'dialogue:obj-blade-capital-lair-2-codex', name: 'The Grand Salle: the clerks’ rule', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A brass plate in a side room, polished by a thousand years of clerks: “No champion of the Ladder shall be crowned who has not tried to touch the Perfect Parry, and failed. A champion who has failed once knows how a bout ends.”', effects: [{ unlockLore: 'lore:hc-blade-grand-salle' }], next: null } },
  },
  {
    id: 'dialogue:obj-blade-capital-lair-3-codex', name: 'The Fencing Hall: the last score', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A bout-board on the side wall, the chalk still on it after thirty years, because nobody would wipe it: “FERRO 5, VELLACOURT 3.” Under it somebody has chalked “AGAIN?” and somebody else, in a different hand, has rubbed it out.', effects: [{ unlockLore: 'lore:hc-blade-fencing-hall' }], next: null } },
  },
  {
    id: 'dialogue:obj-blade-frontier-lair-1-codex', name: 'The Ronin Fort: the old muster-roll', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'An old muster-roll nailed to the inside of the stockade gate, from the Turning days: every company that marched from here to Concordia, and beside each one, “Returned.” Under the last line, in fresh chalk, in letters a hand high: “PRESSED: 41 PILGRIMS.” It is underlined twice.', effects: [{ unlockLore: 'lore:hc-blade-ronin-fort' }], next: null } },
  },
  {
    id: 'dialogue:obj-blade-frontier-lair-2-codex', name: 'The Shrine of the Sheathed Blade: the sheath-rack', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A rack of old sheaths in a side hall, each with a strip of paper tied round it: a name, and the day its owner gave up the sword. “Left the sword at the shrine. Took up the plough.” “Left the sword. Took up my daughter.” The newest strip is thirty years old.', effects: [{ unlockLore: 'lore:hc-blade-sheathed-shrine' }], next: null } },
  },
  {
    id: 'dialogue:obj-blade-frontier-lair-3-codex', name: 'The High Terrace: the bell’s inscription', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Cast into the rim of the High Terrace bell, green with age, so that whoever rings it must read it first: “RING ME AT DAWN, AT THE TURNING, AND TELL THE MOUNTAIN THE SWORDS MAY REST.” Somebody has polished the word “rest” bright with their thumb.', effects: [{ unlockLore: 'lore:hc-blade-high-terrace' }], next: null } },
  },
  {
    id: 'dialogue:blade-basilio', name: 'Ser Basilio Trento (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:basilio-trento', text: 'Ser Basilio Trento, rung 61, once. Thirty years on the wrong side of the arch. Still, the beer is good, and the captain’s Ladder is the only honest one in the world.',
        choices: [
          { text: 'Why is it honest?', to: 'honest' },
          { text: 'Farewell.', to: null, tag: 'leave' },
        ],
      },
      honest: { speaker: 'npc:basilio-trento', text: 'Because the bottom rung gets the best bunk, and nobody ever challenges anybody. They just swap watches. I wish I’d known about it in Edgewater.', next: null },
    },
  },
  {
    id: 'dialogue:blade-hisako', name: 'Pilgrim-Mother Hisako (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hisako', text: '(The old pilgrim looks up from the quiet pew, and smiles, and makes the Temple Road sign: palm flat on the chest. I am here.)',
        choices: [
          { text: '(Make the sign back.)', to: 'sign' },
          { text: '(Bow, and go.)', to: null, tag: 'leave' },
        ],
      },
      sign: { speaker: 'npc:hisako', mood: 'happy', text: '(She nods, very pleased, and closes her eyes again.)', next: null },
    },
  },
];

export default dialogues;
