/**
 * Campaign size report (Claude 4): per class, quests and stages by act, and the dialogue it owns (dialogues, nodes, words).
 * Shared Concordia (cc-) and Heart (heart-) content is reported once, on its own rows.
 * Usage: node $(node tools/narrative/build.mjs tools/narrative/stats.ts full)   (CLASSES=a,b to narrow; TSV=1 for tab-separated)
 */
import { Registry } from '@/core';
import type { DialogueDef, QuestDef } from '@/core';
import { CAMPAIGNS } from '@/narrative/engine/classes';

const CLASSES = (process.env.CLASSES ?? CAMPAIGNS.map((c) => c.id).join(',')).split(',');
const quests = Registry.all('quest') as QuestDef[];
const dialogues = Registry.all('dialogue') as DialogueDef[];
const words = (s: string | undefined) => (s ? s.trim().split(/\s+/).filter(Boolean).length : 0);

function dialogueSize(list: DialogueDef[]) {
  let nodes = 0, w = 0;
  for (const d of list) for (const n of Object.values(d.nodes ?? {})) {
    nodes++;
    w += words(n.text);
    for (const c of n.choices ?? []) w += words(c.text);
  }
  return { dialogues: list.length, nodes, words: w };
}
function questSize(list: QuestDef[]) {
  const stages = (t: (q: QuestDef) => boolean) => list.filter(t).reduce((n, q) => n + q.stages.length, 0);
  const journal = list.reduce((n, q) => n + words(q.summary) + q.stages.reduce((m, s) => m + words(s.journal), 0), 0);
  return {
    quests: list.length,
    a1: stages((q) => q.act === 'act1'), a2: stages((q) => q.act === 'act2'), a3: stages((q) => q.act === 'act3'),
    main: stages((q) => q.type === 'main' || q.type === 'class'), side: stages((q) => q.type === 'side' || q.type === 'bounty'),
    journal,
  };
}
// a class owns dialogue:<class>-…, dialogue:obj-<class>-… and dialogue:area-<class>-…
const owns = (prefix: string) => (d: DialogueDef) => [`dialogue:${prefix}-`, `dialogue:obj-${prefix}-`, `dialogue:area-${prefix}-`].some((p) => d.id.startsWith(p));

const rows: string[][] = [['class', 'quests', 'stages I/II/III', 'main/side stages', 'dialogues', 'nodes', 'dialogue words', 'journal words', 'school-shared words']];
const row = (name: string, q: ReturnType<typeof questSize>, d: ReturnType<typeof dialogueSize>, school = '') =>
  rows.push([name, String(q.quests), `${q.a1}/${q.a2}/${q.a3}`, `${q.main}/${q.side}`, String(d.dialogues), String(d.nodes), String(d.words), String(q.journal), school]);
// school-prefixed scenes (gate seal, lair and optional-area codexes, diaspora talk) are shared by the school pair: shown, not split
for (const cls of CLASSES) {
  const school = CAMPAIGNS.find((c) => c.id === cls)?.school ?? '';
  row(cls, questSize(quests.filter((q) => q.campaign === cls)), dialogueSize(dialogues.filter(owns(cls))), String(dialogueSize(dialogues.filter(owns(school))).words));
}
const shared = (p: string) => quests.filter((q) => q.campaign === 'shared' && q.id.startsWith(`quest:${p}-`));
row('shared: Concordia', questSize(shared('cc')), dialogueSize(dialogues.filter(owns('cc'))));
row('shared: Heart', questSize(shared('heart')), dialogueSize(dialogues.filter(owns('heart'))));

if (process.env.TSV) for (const r of rows) console.log(r.join('\t'));
else {
  const w = rows[0].map((_, i) => Math.max(...rows.map((r) => r[i].length)));
  for (const r of rows) console.log(r.map((c, i) => c.padEnd(w[i])).join('  '));
}
