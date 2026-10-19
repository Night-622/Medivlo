/**
 * Morvane’s optional-area finds: one object scene per find (dialogue:obj-<slug>), each unlocking its codex entry.
 * The text and the codex live in data/lore/hc-morvane-finds.ts. Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';
import { MORVANE_FINDS } from '@/data/lore/hc-morvane-finds';

const dialogues: DialogueDef[] = MORVANE_FINDS.map((f) => ({
  id: `dialogue:obj-${f.slug}` as DialogueDef['id'],
  name: `Morvane find: ${f.lore.name}`,
  scope: 'party' as const,
  entries: [{ node: 'find' }],
  nodes: { find: { speaker: 'narrator', text: f.scene, effects: [{ unlockLore: f.lore.id }], next: null } },
}));

export default dialogues;
