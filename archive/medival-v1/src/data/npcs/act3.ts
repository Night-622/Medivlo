/** Act III NPCs (docs/lore/14-act3-spec.md), Chapter 8 "The Hollow Sea". Owner: Claude 4.
 *  npc:ysolde is defined once, in npcs/aldermoor.ts; her Mirelands presence (presentWhen, schedule, routes to
 *  dialogue:ch8-ysolde and dialogue:ch8-ysolde-fallen) is merged there, not redefined here.
 *  The defs below are speaker-only dream figures for src/data/dialogue/act3-ch8.ts. */
import type { NpcDef } from '@/core';

const R = 'region:mirelands' as const;
const HOME = 'landmark:mireland-shore' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:young-ysolde', name: 'Ysolde', title: 'Hesta’s apprentice, aged twelve', people: 'solenni', region: R, home: HOME,
    presentWhen: { flag: 'never' },
    dialogue: [{ dialogue: 'dialogue:obj-dream-memory-7' }],
    look: { skin: 0xe2c8b0, hair: 0xc8a878, cloth: 0x6a5a48, accent: 0xd8e4ea, build: 'slight' },
    bio: 'Ysolde Maerin as Hesta Corrow remembers her: a thin girl late home from the leys with frost in her hair, asking whether she should listen harder to the thing that sings under the stones. A figure in Hesta’s worst dream in the Mirelands. Speaker entry only.',
    lore: 'lore:ysolde-the-pale-saint',
  },
  {
    id: 'npc:aurenac-novice', name: 'The Novice', title: 'of Saint Sabine’s, Aurenac', people: 'solenni', region: R, home: HOME,
    presentWhen: { flag: 'never' },
    dialogue: [{ dialogue: 'dialogue:obj-dream-memory-6' }],
    look: { skin: 0xc89c78, hair: 0x2a1e18, cloth: 0x8a8a84, accent: 0xf0a040, build: 'slight' },
    bio: 'The fourteen-year-old novice Vesper Qadri carried over the wall of the burning abbey at Aurenac twenty years ago, as Vesper dreams her in the Mirelands: soot-black, a flame burning on her fingertip, waiting for Vesper to go back into the fire. The real girl is a Pyre of the Creed in Haldren. Speaker entry only.',
    lore: 'lore:vesper-qadri',
  },
  {
    id: 'npc:the-unmarked', name: 'The Unmarked', title: 'the one it missed', people: 'haldish', region: R, home: HOME,
    presentWhen: { flag: 'never' },
    dialogue: [{ dialogue: 'dialogue:obj-dream-memory-1' }],
    look: { skin: 0xd8b898, hair: 0x5a4030, cloth: 0x4a4038, accent: 0x1c2a33, build: 'average' },
    bio: 'The player as the Mire offers them in their own worst dream: the one standing a pace to the left on Brindle Moor on the Night of Falling Ash, whom the falling Ember missed. Whole-handed, blameless, and asleep under the black water by the second winter. Speaker entry only.',
    lore: 'lore:the-ashmark',
  },
];

export default npcs;
