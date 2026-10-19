/** NPCs for the companion personal quests, part 2 (docs/lore/13-companions.md §1). Owner: Claude 4. Landmarks are placed by Claude 2. */
import type { NpcDef } from '@/core';

const npcs: NpcDef[] = [
  {
    id: 'npc:ulka-ironsong', name: 'Ulka Ironsong', title: 'Clan-mother of Ironsong', people: 'orrun', faction: 'faction:iron-concord',
    shop: 'shop:ulka-smithy',
    region: 'region:ironspine-foothills', home: 'landmark:grimmas-forge',
    // comes down the mountain for the hearing in quest:iron-remembers, and goes back up once it is over
    presentWhen: {
      any: [
        { questStage: 'quest:iron-remembers', stage: 'hearing' },
        { all: [{ flag: 'companion.grimma-ironsong.ring' }, { not: { flag: 'npc.ulka-ironsong.left' } }] },
      ],
    },
    dialogue: [{ dialogue: 'dialogue:ir-ulka-hearing' }],
    barks: [{ lines: ['(She looks at the forge as if it owed her money.)', 'Hm.', 'Grenn. Ice on every step of that road.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0x8c8478, hair: 0xe8e4dc, cloth: 0x3c3630, accent: 0x9a9aa2, build: 'short' },
    bio: 'Clan-mother of Ironsong, a hundred and ninety years old, her knuckles and temples gone to granite. Grimma’s mother’s sister. She held Grimma at her naming and cut her oath-ring through with a cold chisel at her exile, and her hand shook neither time. Her hair is braided to the knee with one iron ring for every Ironsong she has named.',
  },
  {
    id: 'npc:eluned-of-ys', name: 'Eluned', title: 'Loremaster of Ys Aerwen', people: 'aelthi', faction: 'faction:thornwise',
    region: 'region:ylwen-deepwood', home: 'landmark:ys-aerwen-shore',
    // a voice at the bottom of the lake, heard during the dive in dialogue:obj-ys-aerwen-stair; never a body in the world
    presentWhen: { flag: 'never' },
    dialogue: [{ dialogue: 'dialogue:obj-ys-aerwen-stair' }],
    look: { skin: 0xb8c8c0, hair: 0x6a8a7a, cloth: 0x2a4a42, accent: 0xc8e0e0, build: 'tall' },
    bio: 'The loremaster who made the Lullaby, drowned with Ys Aerwen on the night it was sung. She stands on the singers’ dais in the sunken court and has gone on singing the last verse, alone, ever since. Speaker entry only.',
  },
];

export default npcs;
