/** Trigger-zone barks for Aldermoor's valley exits (Claude 2 places area:exit-*). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const blocked = (dir: string, text: string, open?: { flag: string }): DialogueDef => ({
  id: `dialogue:area-exit-${dir}`, name: `Area: exit ${dir}`, bark: true,
  entries: [{ when: { not: open ?? { flag: 'prologue.complete' } }, node: 'n' }],
  nodes: { n: { speaker: 'narrator', text } },
});

const dialogues: DialogueDef[] = [
  blocked('north', 'The King’s Way is choked with storm-felled pines, frozen together. No getting through with an axe this winter.'),
  blocked('east', 'Elder Godric’s barricade blocks the Varn Causeway: carts, hurdles, and a sign that says TURN BACK. MARSH FEVER. HOLLOWED.'),
  {
    id: 'dialogue:area-exit-south', name: 'Area: exit south', bark: true,
    entries: [{ when: { not: { all: [{ flag: 'prologue.complete' }, { flag: 'act1.complete' }] } }, node: 'n' }],
    nodes: { n: { speaker: 'narrator', text: 'A Wick toll-gate bars the Pilgrim’s Road. Soldiers in white tabards turn back anyone with a covered hand.' } },
  },
];

export default dialogues;
