/**
 * Skill-tree allocation and respec (SYSTEMS.md §5).
 */
import { Registry, bus } from '@/core';
import type { GameState, SkillNodeDef, SkillTreeDef, SkillTreeId } from '@/core';
import { FREE_RESPEC_BELOW_LEVEL } from '../balance';
import { classOf } from '../stats/collect';

export function treeRanks(state: GameState, treeId: string): Record<string, number> {
  return state.player.progression.tree[treeId] ?? {};
}

export function pointsInTree(state: GameState, treeId: string): number {
  const tree = Registry.tryGet('skilltree', treeId);
  const ranks = treeRanks(state, treeId);
  let n = 0;
  for (const [id, r] of Object.entries(ranks)) {
    const node = tree?.nodes.find((x) => x.id === id);
    n += r * (tree && node ? nodeCost(state, tree, node) : 1);
  }
  return n;
}

/** Trees the player may spend in: class tree, subclass tree, Second Oath tree. */
export function availableTrees(state: GameState): SkillTreeDef[] {
  const cls = classOf(state);
  if (!cls) return [];
  const ids: string[] = [cls.tree];
  const sub = cls.subclasses.find((s) => s.id === state.player.progression.subclassId);
  if (sub) ids.push(sub.tree);
  if (state.player.progression.secondTree) ids.push(state.player.progression.secondTree);
  return ids.map((id) => Registry.tryGet('skilltree', id)).filter((t): t is SkillTreeDef => !!t);
}

export type AllocCheck = { ok: true } | { ok: false; reason: string };

export const SUBCLASS_LEVEL = 15;
export const SECOND_OATH_LEVEL = 25;

/** the Second Oath tree: tiers 1–3 only, no keystones, +1 point per rank */
export function isSecondOath(state: GameState, treeId: string): boolean {
  return state.player.progression.secondTree === treeId;
}

export function nodeCost(state: GameState, tree: SkillTreeDef, node: SkillNodeDef): number {
  return node.costPerRank + (isSecondOath(state, tree.id) ? 1 : 0);
}

export function chooseSubclass(state: GameState, id: string): AllocCheck {
  const cls = classOf(state);
  const pr = state.player.progression;
  const sub = cls?.subclasses.find((s) => s.id === id);
  if (!cls || !sub) return { ok: false, reason: 'Unknown subclass' };
  if (pr.subclassId) return { ok: false, reason: 'You have already chosen your path' };
  if (pr.level < sub.unlockLevel) return { ok: false, reason: `Reach level ${sub.unlockLevel}` };
  if (!Registry.tryGet('skilltree', sub.tree)) return { ok: false, reason: 'That path is not yet written' };
  pr.subclassId = id;
  bus.emit('subclass:chosen', { id });
  bus.emit('stats:changed', {});
  return { ok: true };
}

/** classes whose main tree may be taken as the Second Oath */
export function secondOathOptions(state: GameState): SkillTreeDef[] {
  const own = classOf(state)?.id;
  return Registry.all('class').filter((c) => c.id !== own && c.phase <= 2).map((c) => Registry.tryGet('skilltree', c.tree)).filter((t): t is SkillTreeDef => !!t);
}

export function chooseSecondOath(state: GameState, treeId: SkillTreeId): AllocCheck {
  const pr = state.player.progression;
  if (pr.secondTree) return { ok: false, reason: 'You have already sworn a Second Oath' };
  if (pr.level < SECOND_OATH_LEVEL) return { ok: false, reason: `Reach level ${SECOND_OATH_LEVEL}` };
  if (!secondOathOptions(state).some((t) => t.id === treeId)) return { ok: false, reason: 'Not an available oath' };
  pr.secondTree = treeId;
  bus.emit('stats:changed', {});
  return { ok: true };
}

export function canAllocate(state: GameState, tree: SkillTreeDef, node: SkillNodeDef): AllocCheck {
  const pr = state.player.progression;
  const ranks = treeRanks(state, tree.id);
  const cur = ranks[node.id] ?? 0;
  if (cur >= node.maxRank) return { ok: false, reason: 'Maxed' };
  const cost = nodeCost(state, tree, node);
  if (pr.unspentSkillPoints < cost) return { ok: false, reason: cost > 1 ? `Needs ${cost} skill points` : 'No skill points' };
  if (isSecondOath(state, tree.id) && (node.tier > 3 || node.type === 'keystone')) return { ok: false, reason: 'Second Oath: tiers I–III only, no keystones' };
  const need = tree.tierThresholds[node.tier - 1] ?? 0;
  if (pointsInTree(state, tree.id) < need) return { ok: false, reason: `Requires ${need} points in this tree` };
  if (node.requiresAll?.some((id) => !(ranks[id] > 0))) return { ok: false, reason: 'Requires previous nodes' };
  if (node.requiresAny && !node.requiresAny.some((id) => ranks[id] > 0)) return { ok: false, reason: 'Requires a connected node' };
  if (node.exclusiveGroup) {
    const taken = tree.nodes.find((n) => n.id !== node.id && n.exclusiveGroup === node.exclusiveGroup && ranks[n.id] > 0);
    if (taken) return { ok: false, reason: `Excludes ${taken.name}` };
  }
  return { ok: true };
}

export function allocate(state: GameState, treeId: SkillTreeId, nodeId: string): AllocCheck {
  const tree = Registry.tryGet('skilltree', treeId);
  const node = tree?.nodes.find((n) => n.id === nodeId);
  if (!tree || !node) return { ok: false, reason: 'Unknown node' };
  const check = canAllocate(state, tree, node);
  if (!check.ok) return check;
  const pr = state.player.progression;
  const ranks = (pr.tree[treeId] ??= {});
  ranks[nodeId] = (ranks[nodeId] ?? 0) + 1;
  pr.unspentSkillPoints -= nodeCost(state, tree, node);
  bus.emit('tree:allocated', { treeId, nodeId, rank: ranks[nodeId] });
  bus.emit('stats:changed', {});
  return { ok: true };
}

export function respecCost(state: GameState): number {
  const pr = state.player.progression;
  if (pr.level < FREE_RESPEC_BELOW_LEVEL) return 0;
  return Math.round(100 * Math.pow(pr.level, 1.5) * Math.min(3, 1 + 0.25 * pr.respecs));
}

/** Full respec: refund all tree points (attributes stay; separate rite later). */
export function respecTrees(state: GameState): boolean {
  const cost = respecCost(state);
  const inv = state.player.inventory;
  if (inv.gold < cost) return false;
  inv.gold -= cost;
  const pr = state.player.progression;
  let refund = 0;
  for (const treeId of Object.keys(pr.tree)) refund += pointsInTree(state, treeId);
  pr.tree = {};
  pr.unspentSkillPoints += refund;
  if (cost > 0) pr.respecs++;
  bus.emit('stats:changed', {});
  return true;
}
