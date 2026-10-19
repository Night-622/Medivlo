/** Act II, Chapter 5 NPCs: the north (Ironspine and Frostreach). docs/lore/11-act2-spec.md. Owner: Claude 4. Landmarks are placed by Claude 2. */
import type { NpcDef } from '@/core';

const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const NAIL = 'quest:the-ninth-nail', MOOT = 'quest:the-wolf-moot';
const atMoot = { any: ['moot', 'deeds', 'duel', 'wits', 'verdict', 'ember'].map((s) => at(MOOT, s)) };
const stolen = { flag: 'act2.moot_outcome', op: '==' as const, value: 'stolen' };

const npcs: NpcDef[] = [
  // ----- Ironspine
  {
    id: 'npc:brannoch-deepforge', name: 'Brannoch Deepforge', title: 'High Thane of the Iron Concord', people: 'orrun', faction: 'faction:iron-concord',
    lore: 'lore:brannoch-deepforge',
    region: 'region:ironspine', home: 'landmark:thane-hall',
    schedule: [
      { from: 0, to: 24, at: 'landmark:heartforge-gate', activity: 'idle', when: { questStage: 'quest:the-heart-of-orr', stage: 'way' } },
      { from: 0, to: 24, at: 'landmark:thane-hall', activity: 'idle' },
    ],
    dialogue: [
      { when: { questActive: 'quest:the-heart-of-orr' }, dialogue: 'dialogue:ch9-brannoch-gate' },
      { when: at(NAIL, 'korrath'), dialogue: 'dialogue:ch5n-brannoch-hall' },
      { when: at(NAIL, 'thane'), dialogue: 'dialogue:ch5n-brannoch-first-nail' },
      { dialogue: 'dialogue:ch5n-brannoch-general' },
    ],
    barks: [
      { when: { flag: 'act2.korrath_flooded' }, lines: ['(He is writing names in the ledger. He does not look up.)', 'Grenn.', 'The ninth stair. It stands at the ninth stair.'] },
      { when: { flag: 'act2.new_nail' }, lines: ['Korr nagh, Ember-hand.', 'Eight hold. Eight. Let the Ironsong woman count that.', '(He is humming, very low, the note the Nails make.)'] },
      { lines: ['Walk soft. The dead are listening.', 'Korr nagh.', '(The iron rings in his beard chime as he turns his head.)'] },
    ],
    roles: ['quest'], essential: true,
    look: { skin: 0x8c8a84, hair: 0xe8e4dc, cloth: 0x3a3430, accent: 0xb08a3a, build: 'short' },
    bio: 'High Thane of the Iron Concord, seated in Korrath-under-Stone, and the oldest living Orrun of Clan Deepforge. Slow, formal and proud, he weighs every word as if it were iron for the ledger. He kept the failure of two Nails secret to stop the holds panicking, and has never been sure he was right.',
  },
  // ----- Frostreach
  {
    id: 'npc:ketil-wolfsbane', name: 'Ketil Wolfsbane', title: 'Raider of Hrimfjord', people: 'hrothi', faction: 'faction:wolf-moot',
    region: 'region:frostreach', home: 'landmark:north-pass-camp',
    presentWhen: { not: stolen },
    schedule: [
      { from: 0, to: 24, at: 'landmark:skelvik', activity: 'drink', when: at(MOOT, 'skelvik') },
      { from: 6, to: 21, at: 'landmark:wolf-moot-stones', activity: 'idle', when: atMoot },
      { from: 21, to: 6, at: 'landmark:skelvik', activity: 'sleep', when: atMoot },
    ],
    dialogue: [
      { when: at(MOOT, 'pass'), dialogue: 'dialogue:ch5n-ketil-pass' },
      { dialogue: 'dialogue:ch5n-ketil-general' },
    ],
    barks: [
      { when: at(MOOT, 'pass'), lines: ['Burning-hand!', 'Sit. The fire is free. The food is not; there is none.', '(He is sharpening an axe that does not need it.)'] },
      { when: { flag: 'act2.moot_outcome', op: '==', value: 'allied' }, lines: ['We wait. We starve politely.', 'The front of it, burning-hand. You promised.'] },
      { lines: ['The star is the road.', 'Calun is laughing. Can you not hear him?', 'Stay in my tracks.'] },
    ],
    roles: ['quest'],
    look: { skin: 0xe8d4c4, hair: 0xd8c08a, cloth: 0x5a4a3a, accent: 0x3a5a8a, build: 'tall' },
    bio: 'A young Hrothi raider of Hrimfjord, starved to the bone and burning with it, who leads the war-band watching the northern pass. He took his byname from a rime-wolf he killed barehanded in the snow, and lost his toes doing it. He believes the fallen Ember is Calun’s sign to march south, and he means to be at the front when they go.',
  },
  {
    id: 'npc:sigrun-ice-eye', name: 'Sigrun Ice-Eye', title: 'Jarl of Skelvik', people: 'hrothi', faction: 'faction:wolf-moot',
    region: 'region:frostreach', home: 'landmark:skelvik-hall',
    schedule: [
      { from: 6, to: 21, at: 'landmark:wolf-moot-stones', activity: 'idle', when: atMoot },
      { from: 21, to: 6, at: 'landmark:skelvik-hall', activity: 'sleep', when: atMoot },
    ],
    dialogue: [
      { when: at(MOOT, 'skelvik'), dialogue: 'dialogue:ch5n-sigrun-hall' },
      { when: { all: [atMoot, { hour: [21, 6] }] }, dialogue: 'dialogue:ch5n-sigrun-general' },
      { when: atMoot, dialogue: 'dialogue:ch5-moot' },
      { dialogue: 'dialogue:ch5n-sigrun-general' },
    ],
    barks: [
      { when: stolen, lines: ['(She turns her white eye toward you, and says nothing.)'] },
      { when: { flag: 'act2.moot_outcome', op: '==', value: 'allied' }, lines: ['When you send, we come.', 'I count less often now.'] },
      { lines: ['(She is notching a counting-stick.)', 'The bench is cold. Everything is.', 'Calun keep you on the road.'] },
    ],
    roles: ['quest'], essential: true,
    look: { skin: 0xe4d8d0, hair: 0x2a2a30, cloth: 0x6a6e74, accent: 0xc8dce8, build: 'tall' },
    bio: 'Jarl of Skelvik and the voice of the Wolf-Moot, widowed in the autumn when her husband Ulfar gave his share of the food to the steadings. One eye was frozen white on the ice of Hrimfjord. Tired, clear-sighted and under pressure from every side, she would rather lose a star than lead her people to die on southern walls.',
    lore: 'lore:sigrun-ice-eye',
  },
];

export default npcs;
