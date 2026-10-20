// QA (Claude 7): every conversation is a sound graph a player can't get stuck in. Per dialogue (and per quest for
// quest effects/conditions):
//   structure  every entry / next / choice.to / check.failTo names a real node; every node reachable from an entry
//   loops      every cycle (strongly connected part) has a way out; no ring of plain lines (Space forever)
//   soft-lock  no node where the shown choices can all be locked (lockedLabel) with nothing always available: the
//              player can't pick, and Esc does nothing while choices are on screen
//   conditions every flag a condition reads is set somewhere (data effects, engine families, world/systems code);
//              an equality test wants a value something sets; quests, stages, NPCs, classes, lore, insights exist
//   effects    setStage / startQuest / completeQuest / failQuest / openDialogue / unlockLore / trust / items exist
// Node only. FAIL lines name the dialogue and node.
//   node tools/e2e/qa-dialogue-graph.mjs [--verbose] [--only structure,loops,…] [--selftest: inject one fault of each kind; all 5 must FAIL]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
// string literals in world / systems / narrative code: flags those set by name count as "set somewhere"
const lits = new Set();
const walkDir = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walkDir(p); else if (p.endsWith('.ts')) for (const m of readFileSync(p, 'utf8').matchAll(/['"`]([a-z][a-z0-9_.-]*\.[a-z0-9_.-]+)['"`]/g)) lits.add(m[1]); } };
for (const d of ['src/world', 'src/systems', 'src/narrative', 'src/data/regions', 'src/ui']) walkDir(d);
const dir = mkdtempSync(join(tmpdir(), 'qa-dialogue-graph-'));
writeFileSync(join(dir, 'lits.json'), JSON.stringify([...lits]));
const entry = join(dir, 'entry.ts');
writeFileSync(entry, String.raw`
import { readFileSync } from 'node:fs';
import { Registry } from '@/core';
import type { DialogueDef, QuestDef, NarrativeCondition, NarrativeEffect } from '@/core';
import { CAMPAIGNS } from '@/narrative/engine/classes';
import { itemInfo } from '@/systems/rules/gear';
const LITS = new Set<string>(JSON.parse(readFileSync(process.env.QA_LITS!, 'utf8')));
const ONLY = (process.env.QA_ONLY ?? '').split(',').filter(Boolean);
const VERBOSE = process.env.QA_VERBOSE === '1';
const dialogues = (Registry.all('dialogue') as DialogueDef[]).filter((d) => !d.bark);
// --selftest: one synthetic conversation with a fault of every kind; every category must FAIL on it
if (process.env.QA_SELFTEST === '1') dialogues.push({ id: 'dialogue:qa-selftest', name: 'qa', entries: [{ node: 'a' }], nodes: {
  a: { speaker: 'narrator', text: 'a', next: 'ghost' },                                              // structure: missing node
  orphan: { speaker: 'narrator', text: 'never reached', next: null },                                 // structure: unreachable
  b: { speaker: 'narrator', text: 'b', choices: [{ text: 'loop', to: 'c', when: { flag: 'qa.never_set_anywhere' }, lockedLabel: '[Locked]' }] }, // soft-lock + condition
  c: { speaker: 'narrator', text: 'c', next: 'b', effects: [{ setStage: 'quest:qa-none' as never, stage: 'x' }] }, // loop with no exit + effect
} } as unknown as DialogueDef);
if (process.env.QA_SELFTEST === '1') (dialogues[dialogues.length - 1].entries as { node: string }[]).push({ node: 'b' });
const quests = Registry.all('quest') as QuestDef[];
const qById = new Map(quests.map((q) => [q.id, q]));
const has = (kind: string, id: string) => { try { return !!Registry.tryGet(kind as never, id as never); } catch { return false; } };
const CLASSES = new Set(CAMPAIGNS.map((c) => c.id));
const ENGINE_PREFIX = ['hint.', 'tut.', 'met.', 'insight.', 'escort.', 'companion.', 'trust.', 'campaign.', 'shop.', 'content.'];

// ── what gets set: every setFlag / addFlag / insight in dialogue + quest effects (values per key) ──
const setVals = new Map<string, Set<string>>(); const numeric = new Set<string>(); const insights = new Set<string>();
const noteEffects = (effs?: NarrativeEffect[]) => { for (const e of effs ?? []) {
  const x = e as Record<string, unknown>;
  if ('setFlag' in x) { const k = String(x.setFlag); if (!setVals.has(k)) setVals.set(k, new Set()); setVals.get(k)!.add(JSON.stringify(x.value)); }
  if ('addFlag' in x) numeric.add(String(x.addFlag));
  if ('insight' in x) insights.add(String(x.insight));
} };
for (const d of dialogues) for (const n of Object.values(d.nodes)) { noteEffects(n.effects); for (const c of n.choices ?? []) { noteEffects(c.effects); if (c.insight) insights.add(c.insight); } }
for (const q of quests) { noteEffects((q as { onStart?: NarrativeEffect[] }).onStart); noteEffects((q as { onComplete?: NarrativeEffect[] }).onComplete); for (const s of q.stages) { noteEffects(s.onEnter); noteEffects(s.onComplete); } }
const flagSet = (k: string) => setVals.has(k) || numeric.has(k) || LITS.has(k) || ENGINE_PREFIX.some((p) => k.startsWith(p)) || k.startsWith('story.sentinel.');

// ── condition / effect checks (return problem strings) ──
const condProblems = (c: NarrativeCondition | undefined, out: string[]) => {
  if (!c) return;
  const x = c as Record<string, unknown>;
  if ('all' in x) return (x.all as NarrativeCondition[]).forEach((y) => condProblems(y, out));
  if ('any' in x) return (x.any as NarrativeCondition[]).forEach((y) => condProblems(y, out));
  if ('not' in x) return condProblems(x.not as NarrativeCondition, out);
  if ('flag' in x) {
    const k = String(x.flag);
    if (!flagSet(k)) out.push('reads flag ' + k + ', which nothing sets');
    else if ('value' in x && (x.op === undefined || x.op === '==') && setVals.has(k) && !numeric.has(k) && !LITS.has(k) && !setVals.get(k)!.has(JSON.stringify(x.value)) && x.value !== false && x.value !== 0)
      out.push('wants ' + k + ' == ' + JSON.stringify(x.value) + ' but it is only ever set to ' + [...setVals.get(k)!].join(' / '));
  }
  if ('questStage' in x) { const q = qById.get(String(x.questStage)); if (!q) out.push('questStage of unknown quest ' + x.questStage); else if (!q.stages.some((s) => s.id === x.stage)) out.push('questStage ' + x.questStage + ' has no stage ' + x.stage); }
  for (const k of ['questCompleted', 'questActive', 'questFailed', 'questOutcome']) if (k in x && !qById.has(String(x[k]))) out.push(k + ' of unknown quest ' + x[k]);
  if ('trust' in x && !has('npc', String(x.trust))) out.push('trust of unknown NPC ' + x.trust);
  for (const k of ['heroClass', 'classIs', 'partyHasClass']) if (k in x && !CLASSES.has(String(x[k]).replace(/^class:/, ''))) out.push(k + ' of unknown class ' + x[k]);
  if ('loreUnlocked' in x && !has('lore', String(x.loreUnlocked))) out.push('loreUnlocked of unknown lore ' + x.loreUnlocked);
  if ('insight' in x && !insights.has(String(x.insight)) && !LITS.has('insight.' + x.insight)) out.push('needs insight ' + x.insight + ', which no choice or effect grants');
};
const effProblems = (effs: NarrativeEffect[] | undefined, out: string[]) => { for (const e of effs ?? []) {
  const x = e as Record<string, unknown>;
  if ('setStage' in x) { const q = qById.get(String(x.setStage)); if (!q) out.push('setStage of unknown quest ' + x.setStage); else if (!q.stages.some((s) => s.id === x.stage)) out.push('setStage ' + x.setStage + ' to missing stage ' + x.stage); }
  for (const k of ['startQuest', 'completeQuest', 'failQuest']) if (k in x && !qById.has(String(x[k]))) out.push(k + ' of unknown quest ' + x[k]);
  if ('openDialogue' in x && !has('dialogue', String(x.openDialogue))) out.push('openDialogue of unknown dialogue ' + x.openDialogue);
  if ('unlockLore' in x && !has('lore', String(x.unlockLore))) out.push('unlockLore of unknown lore ' + x.unlockLore);
  if ('trust' in x && !has('npc', String(x.trust))) out.push('trust on unknown NPC ' + x.trust);
  for (const k of ['giveItem', 'takeItem']) if (k in x && !itemInfo(String(x[k])) && !has('item', String(x[k]))) out.push(k + ' of unknown item ' + x[k]);
} };

type Row = { cat: string; id: string; problems: string[] };
const rows: Row[] = [];
for (const d of dialogues) {
  const N = d.nodes, ids = Object.keys(N);
  const struct: string[] = [], loops: string[] = [], soft: string[] = [], conds: string[] = [], effs: string[] = [];
  // edges: id → targets (null = the conversation ends)
  const edges = new Map<string, (string | null)[]>();
  for (const [id, n] of Object.entries(N)) {
    const t: (string | null)[] = [];
    if (n.choices?.length) for (const c of n.choices) { t.push(c.to ?? null); if (c.check) t.push(c.check.failTo ?? null); }
    if (!n.choices?.length || n.next !== undefined) t.push(n.next ?? null); // a node whose choices can all hide falls through to next
    edges.set(id, t);
    for (const x of t) if (x !== null && !N[x]) struct.push('@' + id + ' → missing node "' + x + '"');
  }
  for (const e of d.entries) { if (!N[e.node]) struct.push('entry → missing node "' + e.node + '"'); condProblems(e.when, conds); }
  const seen = new Set<string>(); const stack = d.entries.map((e) => e.node).filter((x) => N[x]);
  while (stack.length) { const x = stack.pop()!; if (seen.has(x)) continue; seen.add(x); for (const y of edges.get(x) ?? []) if (y && N[y]) stack.push(y); }
  const dead = ids.filter((x) => !seen.has(x));
  if (dead.length) struct.push('unreachable node(s): ' + dead.slice(0, 5).join(', ') + (dead.length > 5 ? ' …+' + (dead.length - 5) : ''));
  // loops: Tarjan SCCs; a cycle needs an exit (an edge out of it, or an end)
  let idx = 0; const index = new Map<string, number>(), low = new Map<string, number>(), on = new Set<string>(), st: string[] = [];
  const scc = (v: string) => {
    index.set(v, idx); low.set(v, idx); idx++; st.push(v); on.add(v);
    for (const w of edges.get(v) ?? []) { if (!w || !N[w]) continue; if (!index.has(w)) { scc(w); low.set(v, Math.min(low.get(v)!, low.get(w)!)); } else if (on.has(w)) low.set(v, Math.min(low.get(v)!, index.get(w)!)); }
    if (low.get(v) === index.get(v)) {
      const comp: string[] = []; let w: string; do { w = st.pop()!; on.delete(w); comp.push(w); } while (w !== v);
      const cyc = comp.length > 1 || (edges.get(v) ?? []).includes(v);
      if (cyc) {
        const inC = new Set(comp);
        const exit = comp.some((x) => (edges.get(x) ?? []).some((y) => y === null || !inC.has(y)));
        if (!exit) loops.push('cycle with no way out: ' + comp.slice(0, 6).join(' → '));
        if (comp.every((x) => !N[x].choices?.length)) loops.push('ring of plain lines (Space forever): ' + comp.slice(0, 6).join(' → '));
      }
    }
  };
  for (const v of ids) if (!index.has(v)) scc(v);
  for (const [id, n] of Object.entries(N)) {
    effProblems(n.effects, effs);
    const cs = n.choices ?? [];
    for (const c of cs) { condProblems(c.when, conds); effProblems(c.effects, effs); }
    if (cs.length) {
      const always = cs.some((c) => !c.when && !c.school && !c.once);
      const lockable = cs.some((c) => c.when && c.lockedLabel && !c.insight);
      if (!always && lockable) soft.push('@' + id + ': every choice is conditional and some show locked: all shown can be locked (no pick, no Esc)');
    }
  }
  rows.push({ cat: 'structure', id: d.id, problems: struct }, { cat: 'loops', id: d.id, problems: loops }, { cat: 'soft-locks', id: d.id, problems: soft },
    { cat: 'conditions', id: d.id, problems: conds }, { cat: 'effects', id: d.id, problems: effs });
}
for (const q of quests) {
  const conds: string[] = [], effs: string[] = [];
  condProblems((q as { requires?: NarrativeCondition }).requires, conds);
  effProblems((q as { onComplete?: NarrativeEffect[] }).onComplete, effs);
  for (const s of q.stages) { effProblems(s.onEnter, effs); effProblems(s.onComplete, effs);
    if (Array.isArray(s.next)) for (const b of s.next) { condProblems(b.when, conds); if (!q.stages.some((x) => x.id === b.to)) effs.push('stage ' + s.id + ' branches to missing stage ' + b.to); }
    else if (typeof s.next === 'string' && !q.stages.some((x) => x.id === s.next)) effs.push('stage ' + s.id + ' → missing stage ' + s.next);
    for (const o of s.objectives) if ('when' in o) condProblems((o as { when: NarrativeCondition }).when, conds); }
  rows.push({ cat: 'conditions', id: q.id, problems: conds }, { cat: 'effects', id: q.id, problems: effs });
}
for (const cat of ['structure', 'loops', 'soft-locks', 'conditions', 'effects']) {
  if (ONLY.length && !ONLY.includes(cat)) continue;
  const mine = rows.filter((r) => r.cat === cat), bad = mine.filter((r) => r.problems.length);
  console.log((bad.length ? 'FAIL ' : 'PASS ') + cat + ': ' + (mine.length - bad.length) + '/' + mine.length + ' clean');
  for (const r of bad.slice(0, VERBOSE ? 9999 : 6)) console.log('    ' + r.id + ' :: ' + r.problems.slice(0, VERBOSE ? 99 : 2).join(' | '));
  if (!VERBOSE && bad.length > 6) console.log('    … ' + (bad.length - 6) + ' more (--verbose)');
  console.log('ROW ' + (mine.length - bad.length) + ' ' + mine.length);
}
`);
const out = join(dir, 'entry.mjs');
let res = '';
try {
  execFileSync(process.execPath, ['tools/narrative/build.mjs', entry, 'full'], { env: { ...process.env, OUT: out }, stdio: ['ignore', 'ignore', 'inherit'] });
  res = execFileSync(process.execPath, [out], { env: { ...process.env, QA_LITS: join(dir, 'lits.json'), QA_SELFTEST: process.argv.includes('--selftest') ? '1' : '0', QA_ONLY: arg('only', ''), QA_VERBOSE: process.argv.includes('--verbose') ? '1' : '0' }, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) { res = `${e.stdout ?? ''}\nFAIL harness :: ${String(e.message).split('\n')[0]}\nROW 0 1`; }
for (const l of res.split('\n')) if (/^(PASS|FAIL|    )/.test(l)) console.log(l);
const rows = [...res.matchAll(/^ROW (\d+) (\d+)/gm)].map((m) => [Number(m[1]), Number(m[2])]);
const passed = rows.reduce((n, r) => n + r[0], 0), total = rows.reduce((n, r) => n + r[1], 0);
console.log(`\n${passed}/${total || 1} passed`);
process.exit(total && passed === total ? 0 : 1);
