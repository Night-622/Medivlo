/**
 * Moved out of src on 2026-10-21 (Claude 3, Claude 1's dead-code cleanup): exports with no importers anywhere in
 * src / tools / server (TypeScript compiler graph scan), kept here as they were, never deleted. Not compiled.
 */

// ── src/systems/rules/tree.ts (export { pc }) ──
// const pc = (v: number) => `${Math.round(v * 100)}%`;

// ── src/systems/rules/stats.ts ──
// export const stat = (t: StatTable, k: StatKey): number => t[k] ?? 0;

// ── src/systems/rules/runes.ts ──
// export const MAX_RUNE_SLOTS = 2;

// ── src/systems/view/CombatView.ts (export { RARITY_GLOW }) ──
// const RARITY_GLOW: Record<string, number> = { common: 0xb7c0e3, fine: 0x5fe06a, ember: 0xff9a3c, runed: 0x38b6ff, wrought: 0xb766ff, spark: 0xffd23f };

// ── src/data/enemies/hc/campaign.ts ──
// /** The eight boss fights of a class campaign, in order (creature ids). */
// export function campaignBosses(classId: string, school: string, sentinels: [string, string]): string[] {
//   const own = HC_CAMPAIGN_BOSSES.filter((b) => b.classId === classId);
//   return [HC_LAIR1[classId], own.find((b) => b.slot === 'lair2')!.id, own.find((b) => b.slot === 'nemesis')!.id, `bx_${school}_5`,
//     sentinels[0], sentinels[1], own.find((b) => b.slot === 'herald' || b.slot === 'chimera')!.id, 'bx_concord_5', 'bx_hollowking'];
// }
