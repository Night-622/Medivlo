/** Prologue side quests (docs/lore/07-prologue.md). Owner: Claude 4. */
import type { QuestDef } from '@/core';

const quests: QuestDef[] = [
  {
    id: 'quest:smoke-from-the-barrow', name: 'Smoke from the Barrow', type: 'side', act: 'prologue', region: 'region:aldermoor', giver: 'npc:godric-thatch',
    summary: 'Lights have been seen at Edric’s Barrow on the moor. Elder Godric wants to know who is disturbing the old king’s rest.',
    firstStage: 'barrow',
    stages: [
      {
        id: 'barrow', journal: 'Someone has been digging at Edric’s Barrow. Reavers, by the tracks.',
        objectives: [
          { id: 'reach', text: "Go to Edric's Barrow", reach: 'landmark:edrics-barrow', marker: { landmark: 'landmark:edrics-barrow' } },
          { id: 'cut', text: 'Drive off the Ashfoot Reavers', kill: 'enemy:ashfoot-cutthroat', count: 2 },
          { id: 'arch', text: 'Deal with their archers', kill: 'enemy:ashfoot-archer', count: 2 },
        ],
        next: 'door',
      },
      {
        id: 'door', journal: 'The robbers never got past the inner door. Something behind it is awake.',
        objectives: [{ id: 'door', text: 'Examine the inner door', when: { flag: 'side.barrow_voice_heard' }, marker: { landmark: 'landmark:edrics-barrow' } }],
        onComplete: [{ unlockLore: 'lore:the-restless' }, { unlockLore: 'lore:edric-barrowborn' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'Tell Elder Godric what you found at the barrow.',
        objectives: [{ id: 'godric', text: 'Report to Elder Godric', talk: 'npc:godric-thatch', marker: { landmark: 'landmark:elder-hall' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, items: [{ item: 'item:barrow-blade', qty: 1 }] },
  },
  {
    id: 'quest:the-cold-forge', name: 'The Cold Forge', type: 'side', act: 'prologue', region: 'region:aldermoor', giver: 'npc:hild-coalbrook',
    summary: 'Hild Coalbrook’s forge will not hold its heat. She needs ley-coal from the veins up in the tors.',
    firstStage: 'veins',
    stages: [
      {
        id: 'veins', journal: 'Dig ley-coal from three veins in the tors. Your mark will warm when you are close.',
        objectives: [
          { id: 'veins', text: 'Dig ley-coal from the veins', interact: 'obj:ley-coal-vein-*', count: 3 },
          { id: 'wolves', text: 'Watch for wolves', kill: 'enemy:gloamwood-wolf', count: 2, optional: true },
        ],
        next: 'return',
      },
      {
        id: 'return', journal: 'Bring the ley-coal back to Hild.',
        objectives: [{ id: 'hild', text: 'Return to Hild Coalbrook', talk: 'npc:hild-coalbrook', marker: { landmark: 'landmark:coalbrook-smithy' } }],
        onComplete: [{ unlockLore: 'lore:the-heartfire-and-leys', section: 'dead-coal' }, { setFlag: 'side.hild_forge_lit', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1 },
  },
];

export default quests;
