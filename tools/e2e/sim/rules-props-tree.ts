/**
 * rules-props: skill-tree invariants for every class and branch (Claude 5). Structural only, never tied to today's node
 * names, so they hold when phase 3b fills the same 3-branch shape with perks from tables: id prefixes, requirements
 * inside the branch, symmetric exclusions, per-rank text/effects, spell ids that resolve, every node reachable through
 * canLearn, exclusions honoured, resets per branch, and capstone scaling only on 'top' nodes.
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { spellDef } from '@/systems/rules/spells';
import { buildTree, canLearn, rankOf, resetBranch, spentPoints, treePassives, type TreeRanks } from '@/systems/rules/tree';
import { scalePassive } from '@/systems/rules/scale';
import type { Passive, TreeBranch, TreeNode } from '@/systems/rules/types';
import { check } from './features-harness';

const BRANCHES: TreeBranch[] = ['spells', 'skills', 'upgrades'];
const PFX: Record<TreeBranch, string> = { spells: 'sp_', skills: 'sk_', upgrades: 'up_' };
const MANY = 999;

/** Learn greedily (in `order`) until nothing more can be learned; exclusive pairs resolve to whichever comes first. */
function greedy(classId: string, order: TreeNode[], start: TreeRanks = {}): TreeRanks {
  const T: TreeRanks = { ...start };
  for (let changed = true; changed;) {
    changed = false;
    for (const n of order) while (canLearn(classId, n.id, T, MANY).ok) { T[n.id] = (T[n.id] ?? 0) + 1; changed = true; }
  }
  return T;
}

/** Problems with one branch's structure (empty = fine). */
function structure(branch: TreeBranch, nodes: TreeNode[]): string[] {
  const bad: string[] = [], ids = new Set<string>(), byId = new Map(nodes.map((n) => [n.id, n]));
  if (nodes.filter((n) => n.kind === 'root').length !== 1) bad.push('not exactly one root');
  if (!nodes.some((n) => n.kind === 'ult')) bad.push('no ult');
  for (const n of nodes) {
    if (ids.has(n.id)) bad.push(`duplicate id ${n.id}`);
    ids.add(n.id);
    if (!n.id.startsWith(PFX[branch]) || n.branch !== branch) bad.push(`${n.id}: wrong prefix or branch`);
    if (!(n.maxRank >= 1) || n.text.length !== n.maxRank || n.effects.length !== n.maxRank) bad.push(`${n.id}: maxRank ${n.maxRank} vs ${n.text.length} texts / ${n.effects.length} effects`);
    if (n.text.some((t) => !t || /undefined|NaN/.test(t))) bad.push(`${n.id}: empty or broken text`);
    if (!n.free && !n.req.length) bad.push(`${n.id}: not free and has no requirement`);
    for (const r of n.req) if (r === n.id || !byId.has(r)) bad.push(`${n.id}: requirement ${r} missing from the branch`);
    if (n.excludes) {
      const o = byId.get(n.excludes);
      if (!o) bad.push(`${n.id}: excludes ${n.excludes}, not in the branch`);
      else if (o.excludes !== n.id) bad.push(`${n.id} excludes ${o.id} but not back`);
    }
    if (n.grantsSpell && !spellDef(n.grantsSpell)) bad.push(`${n.id}: grants unknown spell ${n.grantsSpell}`);
    for (const fx of n.effects) for (const sm of fx.spellMods ?? []) if (sm.spell !== '*' && !spellDef(sm.spell)) bad.push(`${n.id}: spell mod on unknown spell ${sm.spell}`);
    if (n.effects.some((fx) => Object.values(fx).some((v) => typeof v === 'number' && !Number.isFinite(v)))) bad.push(`${n.id}: non-finite effect`);
  }
  return bad;
}

const same = (a: Passive, b: Passive): boolean => JSON.stringify(a) === JSON.stringify(b);

export function treeProps(only?: string): void {
  const classes = HC_CLASSES.filter((c) => !only || c.id === only);
  for (const c of classes) {
    for (const branch of BRANCHES) {
      const nodes = buildTree(c.id, branch);
      const bad = structure(branch, nodes);
      check(!bad.length, `${c.id} ${branch}: ${nodes.length} nodes well-formed (prefix, requirements, exclusions, ranks, spell ids)`, bad.slice(0, 4).join('; '));

      // reachability through the real canLearn: two greedy passes (first and second of every exclusive pair) cover all
      const A = greedy(c.id, nodes), B = greedy(c.id, [...nodes].reverse());
      const learnable = nodes.filter((n) => !n.free);
      const unreached = learnable.filter((n) => !(A[n.id] || B[n.id])).map((n) => n.id);
      const clash = [A, B].flatMap((T) => nodes.filter((n) => n.excludes && T[n.id] && T[n.excludes]).map((n) => n.id));
      const notMax = [A, B].flatMap((T) => nodes.filter((n) => T[n.id] && rankOf(n, T) !== n.maxRank).map((n) => n.id));
      check(!unreached.length && !clash.length && !notMax.length,
        `${c.id} ${branch}: every node reachable through canLearn, exclusive pairs never both, ranks stop at max`,
        `unreached ${unreached.join(',')}; both of a pair ${clash.join(',')}; not maxed ${notMax.join(',')}`);

      // the gate itself: no points → no; maxed → no; an unmet requirement → no
      const first = learnable.find((n) => canLearn(c.id, n.id, {}, MANY).ok);
      const deep = learnable.find((n) => n.req.length && !n.req.some((r) => nodes.find((x) => x.id === r)?.free));
      const gate = !!first && !canLearn(c.id, first.id, {}, 0).ok && !canLearn(c.id, first.id, { [first.id]: first.maxRank }, MANY).ok
        && (!deep || !canLearn(c.id, deep.id, {}, MANY).ok);
      check(gate, `${c.id} ${branch}: canLearn refuses with no points, when maxed, and before requirements`, `first ${first?.id}, deep ${deep?.id}`);
    }

    // resets: a branch reset clears exactly that branch's ranks and returns its points
    const all = BRANCHES.flatMap((b) => buildTree(c.id, b));
    const full = greedy(c.id, all);
    const resetsOk = BRANCHES.every((b) => {
      const after = resetBranch(full, b);
      const keptOthers = Object.entries(full).every(([id, r]) => (id.startsWith(PFX[b]) ? !(id in after) : after[id] === r));
      const back = Object.entries(full).filter(([id]) => id.startsWith(PFX[b])).reduce((s, [, r]) => s + r, 0);
      return keptOthers && spentPoints(full) - spentPoints(after) === back;
    });
    check(resetsOk, `${c.id}: resetting a branch clears only its ranks and gives back exactly their points`);

    // capstone scaling (Avatar: hook keystonePower): with the ult learned, 'top' nodes in its branch are scaled, nothing else
    for (const branch of BRANCHES) {
      const nodes = buildTree(c.id, branch), ult = nodes.find((n) => n.kind === 'ult');
      const power = ult?.effects[0].hooks?.find((h) => h.id === 'keystonePower')?.value ?? 0;
      if (!ult || !power) continue;
      const T = greedy(c.id, nodes);
      if (!T[ult.id]) { check(false, `${c.id} ${branch}: the capstone can be learned for the scaling check`); continue; }
      const got = treePassives(c.id, T).passives;
      const learned = BRANCHES.flatMap((b) => buildTree(c.id, b)).filter((n) => rankOf(n, T) > 0);
      const want = learned.map((n) => (n.kind === 'top' && n.branch === branch ? scalePassive(n.effects[rankOf(n, T) - 1], 1 + power) : n.effects[rankOf(n, T) - 1]));
      const tops = learned.filter((n) => n.kind === 'top' && n.branch === branch).length;
      check(tops > 0 && got.length === want.length && got.every((p, i) => same(p, want[i])),
        `${c.id} ${branch}: the capstone makes its 'top' nodes ${Math.round(power * 100)}% stronger and leaves every other node as it is`, `${tops} tops, ${got.length} vs ${want.length} passives`);
    }
  }
}
