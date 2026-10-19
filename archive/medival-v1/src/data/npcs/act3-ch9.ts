/** Act III, Chapter 9 NPCs: "The Heart of Orr" (docs/lore/14-act3-spec.md). Owner: Claude 4. */
import type { NpcDef } from '@/core';

const npcs: NpcDef[] = [
  {
    id: 'npc:nhal-risen', name: 'Nhal, Risen', title: 'the Drowned Spark', people: 'drowned', faction: 'faction:drowned-choir',
    region: 'region:heartforge', home: 'landmark:heart-of-orr',
    // speaker entry only: the final boss is enemy:nhal-risen; its scene is opened by the quest and by obj:heartfire
    presentWhen: { flag: 'never' },
    dialogue: [{ dialogue: 'dialogue:ch9-nhal' }],
    look: { skin: 0x141e24, hair: 0x0a0e10, cloth: 0x0a0e10, accent: 0x2e3c44, build: 'tall' },
    bio: 'The Eighth Spark, risen at last out of the Mire into the Heartforge, at the foot of the dying Heart of Orr. It wears the shape of grief: a veiled mourner of black water taller than the ribs of a god, its arms held open, its veil pressed from beneath by a thousand smiling faces. It is a single hunger dressed in pity, and it wants to be the world’s new heart. Speaker entry only.',
    lore: 'lore:nhal-risen',
  },
];

export default npcs;
