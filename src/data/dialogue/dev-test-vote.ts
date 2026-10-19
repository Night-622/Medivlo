/**
 * Test-only party vote (Claude 1's co-op e2e): opened by the DEV helper `narrative.testVote()`. No NPC, quest or
 * object leads here, so players never see it. The pick lands in flag `dev.test_vote` ('a' | 'b'). Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:dev-test-vote', name: 'DEV: two-choice party vote', scope: 'party',
    entries: [{ node: 'ask' }],
    nodes: {
      ask: {
        speaker: 'narrator', text: 'A test of the party vote. Pick one.',
        choices: [
          { text: 'Choice A', to: 'a', effects: [{ setFlag: 'dev.test_vote', value: 'a' }] },
          { text: 'Choice B', to: 'b', effects: [{ setFlag: 'dev.test_vote', value: 'b' }] },
        ],
      },
      a: { speaker: 'narrator', text: 'The party chose A.', next: null },
      b: { speaker: 'narrator', text: 'The party chose B.', next: null },
    },
  },
];

export default dialogues;
