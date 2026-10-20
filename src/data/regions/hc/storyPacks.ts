/**
 * Story-bound packs (Claude 2, from Claude 3's per-class XP table, 2026-10-20): the three class threads whose Act II
 * walks pass the fewest fights (Huntsman, Shade, Samurai, ending Act II about L24 against 24.5+) get a pack at a
 * spot in their own thread, alive only while that quest stage is (once per stage), at the band of the region.
 * Spots from tools/playthrough/out/sparse-spots-act2.md; each stands (dx, dy) tiles off its anchor object, so it
 * doesn't sit on the objective, an NPC or an escort.
 */
export interface StoryPack { id: string; quest: string; stage: string; near: string; dx: number; dy: number; cap: number }

const p = (id: string, quest: string, stage: string, near: string, dx: number, dy: number, cap = 4): StoryPack => ({ id: `story:${id}`, quest, stage, near, dx, dy, cap });

export const STORY_PACKS: StoryPack[] = [
  // Huntsman: the stag's trail out of the Gloamwood, and Corva's camp
  p('huntsman-stag-trail', 'quest:huntsman-the-stags-road', 'trail', 'obj:huntsman-stag-trail-1', 5, 3),
  p('huntsman-stag-offering', 'quest:huntsman-the-stags-road', 'cold', 'obj:huntsman-stag-offering', -6, 2),
  p('huntsman-corva-sign', 'quest:huntsman-the-barons-list', 'sign', 'obj:huntsman-corva-sign-2', 5, -3),
  p('huntsman-corva-camp', 'quest:huntsman-the-barons-list', 'camp', 'obj:huntsman-corva-camp', 6, 3),
  // Shade: the Spinner's web edge, and the stream camp by Stag's Rest
  p('shade-silk-web', 'quest:shade-the-spinners-silk', 'web', 'obj:shade-silk-shadow-2', -6, 3),
  p('shade-thread-knot', 'quest:shade-the-shadow-at-stags-rest', 'thread', 'obj:shade-thread-knot-1', 5, 4),
  p('shade-shadow-camp', 'quest:shade-the-shadow-at-stags-rest', 'camp', 'obj:shade-shadow-camp-1', -6, 3),
  // Samurai: the cut threads under the Gloamwood and the Spinner's web crossing (two packs each). Not the oath stone
  // (kneeling with the Oathbound bearer) or the Silent Muster (walking the ranks without a sound): no fight fits there
  p('samurai-cut-thread-a', 'quest:samurai-the-ronin-under-the-wood', 'threads', 'obj:samurai-cut-thread-1', -6, 3),
  p('samurai-cut-thread-b', 'quest:samurai-the-ronin-under-the-wood', 'threads', 'obj:samurai-cut-thread-3', 6, 3),
  p('samurai-web-crossing-a', 'quest:samurai-the-shadow-on-the-thread', 'web', 'obj:samurai-web-crossing-1', -6, -3),
  p('samurai-web-crossing-b', 'quest:samurai-the-shadow-on-the-thread', 'web', 'obj:samurai-web-crossing-2', 6, -3),
];
