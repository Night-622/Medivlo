/** Hollow Crown, Act III: the Heart of Morvane (04-concordia.md "The Heart"). Owner: Claude 4. */
import type { NpcDef } from '@/core';

const npcs: NpcDef[] = [
  {
    id: 'npc:casimir', name: 'Casimir', title: 'the Hollow King', origin: 'concord', trust: 0,
    region: 'region:heart', home: 'landmark:citadel-throne', lore: 'lore:hc-casimir',
    presentWhen: { any: [{ questStage: 'quest:heart-king', stage: 'casimir' }, { questActive: 'quest:heart-choice' }] },
    dialogue: [
      { when: { questStage: 'quest:heart-king', stage: 'casimir' }, dialogue: 'dialogue:heart-king' },
      { when: { questActive: 'quest:heart-choice' }, dialogue: 'dialogue:heart-choice' },
    ],
    barks: [{ lines: ['(He is weeping. He has been weeping for thirty years.)'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xe0c8b8, hair: 0xd8d8d0, cloth: 0x1a1230, accent: 0x2c3868, build: 'tall' },
    bio: 'Casimir of Concordia, sixty years old, Unsung: born with no school’s spark. Clever, patient, kind to servants, and hollow in a way no teacher could fill. In C. 1012 he put the crown on out of turn, and when it would not sing for him he emptied it.',
  },
  {
    id: 'npc:ottilie-hollis', name: 'Ottilie Hollis', title: 'bearer of C. 1012', school: 'hunt', origin: 'concord', trust: 1,
    region: 'region:heart', home: 'landmark:legion-camp',
    presentWhen: { all: [{ questActive: 'quest:heart-marens-mother' }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: { questStage: 'quest:heart-marens-mother', stage: 'maren' } }],
    dialogue: [{ dialogue: 'dialogue:heart-ottilie' }],
    barks: [{ lines: ['(She is very thin, and very tired, and she has Maren’s nose.)'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0xa8a8a0, cloth: 0x6e5a28, accent: 0xd9b45a, build: 'tall' },
    bio: 'The Hunt bearer of C. 1012, Maren’s mother, who walked into the Heart to hand her stone back to the crown and has stood in the Hollow Legion for thirty years.',
  },
];

export default npcs;
