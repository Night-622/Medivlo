/** Act II, Chapter 6 NPCs: "Nhal" (docs/lore/11-act2-spec.md). Owner: Claude 4. */
import type { NpcDef } from '@/core';

const npcs: NpcDef[] = [
  {
    id: 'npc:nhal', name: 'The Drowned One', title: 'the Eighth Spark', people: 'drowned', faction: 'faction:drowned-choir',
    region: 'region:greywater-marsh', home: 'landmark:black-seep',
    // a voice in dreams and black water, never a body in the world
    presentWhen: { flag: 'never' },
    dialogue: [{ dialogue: 'dialogue:nhal-first' }],
    look: { skin: 0x1c2a33, hair: 0x0e1418, cloth: 0x0e1418, accent: 0x3a4a52, build: 'tall' },
    bio: 'The Eighth Spark, who leapt into the Mire out of pity and has been drowning ever since. Over the ages the pity has become the only thought the dreaming sea has: a single hunger that calls itself “we”. It speaks through Ysolde’s visions in Act II. Speaker entry only.',
    lore: 'lore:nhal-the-drowned',
  },
];

export default npcs;
