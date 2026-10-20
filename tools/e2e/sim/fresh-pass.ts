/**
 * Fresh-character pass (Claude 5 for Claude 1, 2026-10-21). For each class at levels 1, 5 and 10 (0 / 4 / 9 points from
 * levels; quest points not counted): what a new player can pick, whether each pick matters, how many early paths are
 * viable, and how the rank-1 text reads. Report only (no pass/fail gate).
 *   node tools/e2e/sim/run.mjs fresh-pass [classId…]      → tools/e2e/out/fresh-pass.md
 * Value = builds-probe.ts A/B on a starter-geared character (common gear at the level, empty tree): a node is measured
 * at rank 1 on top of its cheapest prerequisite chain; a path is all points spent down one path. Near-zero = < 2% in DPS,
 * survival and EHP, and no utility the probe cannot see (builds-dead.ts DEAD_PCT / utilityOf).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { CLASS_SCHOOL } from '@/core/constants';
import { kitFor } from '@/data/classes/hc/kits';
import { playerText } from '@/systems/rules/describeHc';
import { spellDef } from '@/systems/rules/spells';
import { allNodes, rankOf } from '@/systems/rules/tree';
import type { CharacterSave, TreeNode } from '@/systems/rules/types';
import { DEAD_PCT, survDelta, utilityOf } from './builds-dead';
import { learnList, starterBuild } from './builds-make';
import { calibrate, probe, type Probe } from './builds-probe';

const LEVELS = [1, 5, 10] as const;
const VIABLE: Record<number, number> = { 5: 0.08, 10: 0.12 }; // a path is viable at this combined gain or more
const args = process.argv.slice(3);
const CLASSES = args.length ? args : Object.keys(CLASS_SCHOOL);

const clone = (s: CharacterSave): CharacterSave => structuredClone(s);
const rel = (b: number, a: number): number => (a === 0 ? (b === 0 ? 0 : 1) : (b - a) / Math.abs(a));
const pc = (x: number): string => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;

interface Delta { dDps: number; dSurv: number; dEhp: number; gain: number }
function delta(test: Probe, ref: Probe): Delta {
  const dDps = rel(test.dps, ref.dps), dSurv = survDelta(test, ref), dEhp = rel(test.ehp, ref.ehp);
  // one number for ranking: offence × the better of the two defence reads
  return { dDps, dSurv, dEhp, gain: Math.sqrt(Math.max(0.01, 1 + dDps) * Math.max(0.01, 1 + Math.max(dSurv, dEhp))) - 1 };
}
const small = (d: Delta): boolean => Math.abs(d.dDps) < DEAD_PCT && Math.abs(d.dSurv) < DEAD_PCT && Math.abs(d.dEhp) < DEAD_PCT;

/** Cheapest prerequisite chain (rank 1 each, free nodes cost nothing), excluding the node itself. */
function chain(cls: string, n: TreeNode, memo = new Map<string, string[]>()): string[] {
  const hit = memo.get(n.id);
  if (hit) return hit;
  const nodes = allNodes(cls);
  const reqs = n.req.map((id) => nodes.find((x) => x.id === id)!).filter(Boolean);
  const full = (r: TreeNode) => [...chain(cls, r, memo), ...(r.free ? [] : [r.id])];
  let out: string[] = [];
  if (reqs.length && n.reqAny) out = reqs.map(full).sort((a, b) => a.length - b.length)[0];
  else out = [...new Set(reqs.flatMap(full))];
  memo.set(n.id, out);
  return out;
}

/** Fresh starter at level L: common gear, empty tree, slot 4 empty. */
function fresh(cls: string, L: number): CharacterSave {
  const s = starterBuild(cls, L).save;
  s.tree = {};
  s.hotbar[3] = null;
  return s;
}

function withNodes(s: CharacterSave, ids: string[], spell?: string): CharacterSave {
  const t = clone(s);
  for (const id of ids) t.tree[id] = Math.max(1, t.tree[id] ?? 0);
  const learned = ids.map((id) => allNodes(s.classId).find((n) => n.id === id)?.grantsSpell).filter((x): x is string => !!x && !kitFor(s.classId).spells.includes(x));
  const bind = spell ?? learned[learned.length - 1];
  if (bind) t.hotbar[3] = bind;
  return t;
}

// ───────────── text at rank 1 ─────────────
function textFlags(t: string): string[] {
  const f: string[] = [];
  if (/NaN|undefined|\{v\}|\$\{/.test(t)) f.push('template left');
  if (/× ?1\b/.test(t)) f.push('"× 1" at rank 1');
  if (/(^|[^\d.])0(\.0)?(%| s\b| Ember| stamina)/.test(t) || /\+0(\.0)?(?![\d.])/.test(t)) f.push('zero value');
  if (/\d(s|px)\b/.test(t)) f.push('no space before unit');
  if (/\(\d+(\.\d+)? s/.test(t)) f.push('bare-bracket timing');
  if (t.length > 160) f.push(`long (${t.length})`);
  if (/^[a-z]/.test(t)) f.push('lower-case start');
  return f;
}
const nodeText = (n: TreeNode): string => {
  const sp = n.grantsSpell ? spellDef(n.grantsSpell) : undefined;
  return playerText(sp?.desc && !n.text[0] ? sp.desc : n.text[0] ?? '');
};

// ───────────── per class ─────────────
interface Row { L: number; id: string; name: string; branch: string; cost: number; d: Delta; util: string[]; near: boolean; text: string; flags: string[] }
interface PathRow { L: number; path: string; used: number; d: Delta; viable: boolean }

function paths(cls: string, L: number, base: CharacterSave, P: (s: CharacterSave) => Probe, bp: Probe): PathRow[] {
  const out: PathRow[] = [];
  for (const br of ['sp_', 'sk_', 'up_']) for (const j of [0, 1, 2]) {
    const q = `${br}p${j}`, top = br === 'up_' ? null : `${br}t${j === 2 ? 1 : 0}`;
    const s = clone(base);
    learnList(cls, s, [[`${q}a`, 1], `${q}m1`, `${q}m2`, [`${q}b`, 1], `${q}c1`, ...(top ? [top] : []), [`${q}b`, 3], [`${q}a`, 5], ...(top ? [[top, 3] as [string, number]] : [])]);
    const learned = allNodes(cls).filter((n) => n.grantsSpell && rankOf(n, s.tree) > 0 && !n.free).map((n) => n.grantsSpell!);
    s.hotbar[3] = learned[learned.length - 1] ?? null;
    const used = Object.values(s.tree).reduce((a, b) => a + b, 0);
    const name = allNodes(cls).find((n) => n.id === `${q}a`)?.name ?? q;
    out.push({ L, path: `${q} ${name}`, used, d: delta(P(s), bp), viable: false });
  }
  for (const r of out) r.viable = r.d.gain >= VIABLE[L];
  return out;
}

function runClass(cls: string): { rows: Row[]; paths: PathRow[]; kit: Row[] } {
  const rows: Row[] = [], prs: PathRow[] = [], kit: Row[] = [];
  for (const L of LEVELS) {
    const base = fresh(cls, L);
    const mult = calibrate(base);
    const P = (s: CharacterSave) => probe(s, mult);
    const bp = P(base);
    const pts = Math.max(0, L - 1);
    if (L === 1) {
      // what you start with: the three kit spells, each bound vs that slot empty
      kitFor(cls).spells.forEach((sp, i) => {
        const ref = clone(base); ref.hotbar[i] = null;
        const d = delta(bp, P(ref)), def = spellDef(sp), desc = playerText(def?.desc ?? '');
        kit.push({ L, id: `kit:${i + 1}`, name: def?.name ?? sp, branch: 'kit', cost: 0, d, util: [], near: small(d), text: desc, flags: textFlags(desc) });
      });
      continue;
    }
    const memo = new Map<string, string[]>();
    for (const n of allNodes(cls)) {
      if (n.free || n.kind === 'root') continue;
      const c = chain(cls, n, memo);
      if (c.length + 1 > pts) continue;
      // a choice is measured against the chain without its partner (the chain never holds the partner)
      const ref = withNodes(base, c), test = withNodes(base, [...c, n.id], n.grantsSpell);
      const d = delta(P(test), P(ref)), util = utilityOf(n);
      const text = nodeText(n);
      rows.push({ L, id: n.id, name: n.name, branch: n.id.slice(0, 2), cost: c.length + 1, d, util, near: small(d) && !util.length, text, flags: textFlags(text) });
    }
    prs.push(...paths(cls, L, base, P, bp));
  }
  return { rows, paths: prs, kit };
}

// ───────────── report ─────────────
const md: string[] = ['# Fresh-character pass', '', `Generated by tools/e2e/sim/fresh-pass.ts. Levels ${LEVELS.join(' / ')} = 0 / 4 / 9 points. ` +
  'Δ = rank 1 on top of its cheapest prerequisites, starter gear, probe calibrated per class and level. ' +
  `**near-zero** = < ${DEAD_PCT * 100}% DPS, survival and EHP with no unseen utility. Paths: all points down one path; viable = combined gain √((1+ΔDPS)(1+max(Δsurv, ΔEHP))) − 1 ≥ 8% at level 5, ≥ 12% at level 10. ` +
  'Survival reads are noisy (informational, as in builds). Text is shown as the player sees it (px → paces).', ''];
const summary: string[] = [];
const allFlags = new Map<string, string[]>(), byNode = new Map<string, string[]>();
const t0 = Date.now();
for (const cls of CLASSES) {
  const r = runClass(cls);
  const first = r.rows.filter((x) => x.L === 5 && x.cost === 1);
  const nearFirst = first.filter((x) => x.near);
  const nearAll = r.rows.filter((x) => x.near);
  const v5 = r.paths.filter((p) => p.L === 5 && p.viable && !p.path.startsWith('up_')), v10 = r.paths.filter((p) => p.L === 10 && p.viable && !p.path.startsWith('up_'));
  const kitNear = r.kit.filter((x) => x.near);
  summary.push(`| ${cls} | ${kitNear.map((x) => x.name).join(', ') || '—'} | ${nearFirst.map((x) => x.name).join(', ') || '—'} | ${v5.length} | ${v10.length} | ${[...new Set(nearAll.map((x) => x.name))].length} |`);
  md.push(`## ${cls} (${CLASS_SCHOOL[cls]})`, '');
  md.push('Level 1 (kit spells, bound vs empty):', '', '| spell | ΔDPS | Δsurv | ΔEHP | text |', '|---|---|---|---|---|');
  for (const k of r.kit) md.push(`| ${k.name}${k.near ? ' **near-zero**' : ''} | ${pc(k.d.dDps)} | ${pc(k.d.dSurv)} | ${pc(k.d.dEhp)} | ${k.text} |`);
  for (const L of [5, 10]) {
    md.push('', `Level ${L} picks (cost = points to reach it):`, '', '| node | cost | ΔDPS | Δsurv | ΔEHP | note | rank-1 text |', '|---|---|---|---|---|---|---|');
    for (const x of r.rows.filter((y) => y.L === L).sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id)))
      md.push(`| ${x.id} ${x.name} | ${x.cost} | ${pc(x.d.dDps)} | ${pc(x.d.dSurv)} | ${pc(x.d.dEhp)} | ${x.near ? '**near-zero**' : x.util.length ? `utility: ${x.util.join(', ')}` : ''}${x.flags.length ? ` ⚑ ${x.flags.join(', ')}` : ''} | ${x.text.replace(/\|/g, '/')} |`);
    md.push('', `Level ${L} paths:`, '', '| path | points | ΔDPS | Δsurv | ΔEHP | gain | viable |', '|---|---|---|---|---|---|---|');
    for (const p of r.paths.filter((y) => y.L === L)) md.push(`| ${p.path} | ${p.used} | ${pc(p.d.dDps)} | ${pc(p.d.dSurv)} | ${pc(p.d.dEhp)} | ${pc(p.d.gain)} | ${p.viable ? 'yes' : ''} |`);
  }
  md.push('');
  for (const x of r.rows.filter((y) => y.near)) {
    const k = `L${x.L} ${x.id}`;
    byNode.set(k, [...(byNode.get(k) ?? []), `${cls} ${x.name}`]);
  }
  for (const x of [...r.kit, ...r.rows]) for (const f of x.flags) {
    const k = `${f}: ${x.text}`;
    allFlags.set(k, [...(allFlags.get(k) ?? []), `${cls}/${x.id}`]);
  }
  console.log(`${cls.padEnd(12)} first-pick near-zero ${nearFirst.length}/${first.length} · viable paths L5 ${v5.length} / L10 ${v10.length} · near-zero picks ${nearAll.length}/${r.rows.length} · kit near-zero ${kitNear.length}`);
}
md.splice(4, 0, '| class | kit spell near-zero at L1 | near-zero first picks (1 point) | viable spell/skill paths L5 | L10 | near-zero picks L5+L10 |', '|---|---|---|---|---|---|', ...summary, '',
  '### Near-zero picks by tree position (classes affected)', '',
  ...[...byNode.entries()].sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `- ${k} ×${v.length}: ${v.join(', ')}`), '',
  '### Text flags at rank 1', '', ...[...allFlags.entries()].map(([k, v]) => `- ${k} — ${[...new Set(v.map((x) => x.split('/')[1]))].length > 3 ? `${new Set(v.map((x) => x.split('/')[0])).size} classes` : v.join(', ')}`), '');
mkdirSync('tools/e2e/out', { recursive: true });
writeFileSync('tools/e2e/out/fresh-pass.md', md.join('\n'));
console.log(`report tools/e2e/out/fresh-pass.md · run time ${((Date.now() - t0) / 1000).toFixed(1)} s`);
