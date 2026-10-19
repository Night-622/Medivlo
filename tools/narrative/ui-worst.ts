/** UI QA (Claude 4): the worst real data for each narrative screen, as JSON for tools/narrative/ui-qa.mjs. */
import { Registry } from '@/core';
import type { DialogueDef, LoreEntry, QuestDef } from '@/core';

const quests = Registry.all('quest') as QuestDef[];
const byLen = <T>(xs: T[], f: (x: T) => number) => [...xs].sort((a, b) => f(b) - f(a));
const longestNames = byLen(quests, (q) => q.name.length).slice(0, 12).map((q) => ({ id: q.id, name: q.name, type: q.type }));
const longestObjective = byLen(quests.flatMap((q) => q.stages.flatMap((s) => s.objectives.map((o) => ({ q: q.id, stage: s.id, text: o.text })))), (x) => x.text.length).slice(0, 3);
const longestSummary = byLen(quests, (q) => q.summary.length).slice(0, 2).map((q) => ({ id: q.id, len: q.summary.length }));
const lore = Registry.all('lore') as LoreEntry[];
const loreLen = (l: LoreEntry) => JSON.stringify((l as unknown as { sections?: unknown; body?: unknown }).sections ?? (l as unknown as { body?: unknown }).body ?? '').length;
const longestLore = byLen(lore, loreLen).slice(0, 3).map((l) => ({ id: l.id, title: (l as unknown as { title?: string }).title, len: loreLen(l) }));
// dialogue nodes: most choices, most chips, longest line, longest choice text
const nodes = (Registry.all('dialogue') as DialogueDef[]).flatMap((d) => Object.entries(d.nodes).map(([nid, n]) => ({ d: d.id, nid, entry: d.entries.some((e) => e.node === nid), n })));
const chips = (c: Record<string, unknown>) => ['trust', 'quest', 'insight', 'school', 'lockedLabel', 'check'].filter((k) => c[k] !== undefined).length;
const busiest = byLen(nodes.filter((x) => x.entry && (x.n.choices?.length ?? 0) >= 3), (x) => (x.n.choices ?? []).reduce((a, c) => a + chips(c as never) + c.text.length / 60, 0)).slice(0, 5)
  .map((x) => ({ d: x.d, node: x.nid, choices: x.n.choices!.length, longest: Math.max(...x.n.choices!.map((c) => c.text.length)) }));
const longestLine = byLen(nodes.filter((x) => x.entry), (x) => x.n.text.length).slice(0, 3).map((x) => ({ d: x.d, node: x.nid, len: x.n.text.length }));
console.log(JSON.stringify({ longestNames, longestObjective, longestSummary, longestLore, busiest, longestLine }, null, 1));
