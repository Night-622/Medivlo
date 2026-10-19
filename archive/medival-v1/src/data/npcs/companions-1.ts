/** NPCs for the companion quests, part 1 (docs/lore/13-companions.md §1). Owner: Claude 4. Landmarks are placed by Claude 2. */
import type { NpcDef } from '@/core';

const QM = 'quest:the-hunters-oath', QA = 'quest:a-lantern-for-the-road';

const npcs: NpcDef[] = [
  {
    id: 'npc:brother-sallow', name: 'Brother Sallow', title: 'Reed-Priest of the Drowned Choir', people: 'haldish', faction: 'faction:drowned-choir',
    region: 'region:greywater-marsh', home: 'landmark:fenwick-stilts',
    // under the old smokehouse at the end of the Fenwick landing; only while Maren is hunting him
    presentWhen: { all: [{ questStage: QM, stage: 'sallow' }, { not: { flag: 'companion.maren-hollis.oath' } }] },
    dialogue: [{ dialogue: 'dialogue:oath-sallow' }],
    barks: [{ lines: ['Hush, lamb, the water’s warm…', '(He is singing a cradle-song in a woman’s voice.)', 'Ooluun ae Nhal…'] }],
    roles: ['quest'],
    look: { skin: 0xc8b8a8, hair: 0x4a4a3a, cloth: 0x5a6a4a, accent: 0x1c2a33, build: 'slight' },
    bio: 'A reed-priest of the Drowned Choir who came up the River Grey in the autumn before the Night of Falling Ash and sang on the shore of Wennamere after dark. He taught Oswin the miller his hymns. Tobin Hollis came down to the water to listen.',
  },
  {
    id: 'npc:saint-wenna', name: 'Wenna', title: 'Saint of the Mere', people: 'haldish', faction: 'faction:lanternate',
    region: 'region:aldermoor', home: 'landmark:abbey-nave',
    // a ghost, present only during Anselm’s vigil at the altar
    presentWhen: { all: [{ questStage: QA, stage: 'vigil' }, { not: { flag: 'companion.anselm-pryde.path' } }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:abbey-nave', activity: 'pray' }],
    dialogue: [{ dialogue: 'dialogue:obj-abbey-altar' }],
    roles: ['quest'],
    look: { skin: 0xf0d8b0, hair: 0xb89868, cloth: 0xe8d8b8, accent: 0xf4d27a, build: 'short' },
    bio: 'Wenna of the Mere, abbess around 780 YL, who cured the marsh-fever of the eastern Haldmarch and kept a lamp for travellers by her abbey door. Her ghost is warm-lit, plain-faced and kind.',
    lore: 'lore:saint-wenna',
  },
];

export default npcs;
