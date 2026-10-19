/**
 * Campaign audit (Claude 4's consistency pass): checks each class campaign's data against
 * docs/lore/hollow-crown/10-campaign-style.md. Usage: CLASSES=arcanist,reaver node $(node tools/narrative/build.mjs tools/narrative/audit.ts)
 */
import { Registry } from '@/core';
import type { DialogueDef, NpcDef, QuestDef } from '@/core';
import { CAMPAIGNS } from '@/narrative/engine/classes';

const CLASSES = (process.env.CLASSES ?? CAMPAIGNS.map((c) => c.id).join(',')).split(',');
const quests = Registry.all('quest') as QuestDef[];
const dialogues = Registry.all('dialogue') as DialogueDef[];
const npcs = Registry.all('npc') as NpcDef[];
let bad = 0;
const fail = (cls: string, msg: string) => { bad++; console.log(`  ✗ ${cls}: ${msg}`); };

// global: NPC names must be unique (bearers excepted: they are one def per class)
const byName = new Map<string, string[]>();
for (const n of npcs) byName.set(n.name, [...(byName.get(n.name) ?? []), n.id]);
// the same character appearing in a second place is one id plus a suffix (npc:golem-nine, npc:golem-nine-kilnmouth)
// (or ids sharing the character's first name token: npc:lucan-brightwater / npc:lucan-in-the-wood)
const sameChar = (ids: string[]) => {
  const base = [...ids].sort((a, b) => a.length - b.length)[0];
  const tok = (i: string) => i.slice(4).split('-')[0];
  return ids.every((i) => i === base || i.startsWith(base + '-') || tok(i) === tok(base));
};
for (const [name, ids] of byName) if (ids.length > 1 && !sameChar(ids)) fail('names', `"${name}" used by ${ids.join(', ')}`);

for (const cls of CLASSES) {
  const c = CAMPAIGNS.find((x) => x.id === cls);
  if (!c) { fail(cls, 'unknown class'); continue; }
  const mine = quests.filter((q) => q.campaign === cls);
  if (!mine.length) { console.log(`- ${cls}: no data yet`); continue; }
  const j = (q: QuestDef) => JSON.stringify(q);
  const a1 = mine.filter((q) => q.act === 'act1'), a2 = mine.filter((q) => q.act === 'act2'), a3 = mine.filter((q) => q.act === 'act3');
  const count = (list: QuestDef[], t: QuestDef['type']) => list.filter((q) => q.type === t).length;
  console.log(`- ${cls}: act1 ${a1.length} (main ${count(a1, 'main')}, side ${count(a1, 'side')}, bounty ${count(a1, 'bounty')}) · act2 ${a2.length} · act3 ${a3.length}`);
  if (count(a1, 'main') !== 10) fail(cls, `Act I main = ${count(a1, 'main')} (want 10)`);
  if (count(a1, 'side') !== 10) fail(cls, `Act I side = ${count(a1, 'side')} (want 8 side + 2 mentor = 10)`);
  if (count(a1, 'bounty') !== 2) fail(cls, `Act I bounties = ${count(a1, 'bounty')} (want 2)`);
  if (a2.length !== 8) fail(cls, `Act II class quests = ${a2.length} (want C-1…C-6 + 2 featured = 8)`);
  const starts = a1.filter((q) => q.autoStart);
  if (!starts.some((q) => JSON.stringify(q.requires) === JSON.stringify({ heroClass: cls }))) fail(cls, 'no I-1 autoStart gated by { heroClass } alone');
  if (!mine.some((q) => j(q).includes('"setFlag":"story.gate_open"') && j(q).includes('"setFlag":"story.act","value":2'))) fail(cls, 'no quest sets story.gate_open + story.act = 2');
  if (!mine.some((q) => j(q).includes('"setFlag":"story.act2_ready"'))) fail(cls, 'nothing sets story.act2_ready (C-6)');
  if (!mine.some((q) => j(q).includes(`sentinel-release-`))) fail(cls, 'no Sentinel release scene opened (C-3/C-5)');
  if (!mine.some((q) => j(q).includes('"value":"friendly"'))) fail(cls, 'no mentor quest gated at Friendly');
  if (!mine.some((q) => j(q).includes('"value":"trusted"'))) fail(cls, 'no mentor quest gated at Trusted');
  if (!mine.some((q) => /"setFlag":"[a-z]+\.[a-z-]+_devotable"/.test(j(q)))) fail(cls, 'nothing sets <class>.<mentor>_devotable');
  for (const b of c.featured) {
    const f = a2.find((q) => j(q).includes(`"setFlag":"story.bearer.${b}"`));
    if (!f) { fail(cls, `featured bearer ${b}: no quest sets story.bearer.${b}`); continue; }
    if (!f.autoStart || !j(f).includes(`"partyHasClass":"${b}"`)) fail(cls, `featured ${f.id}: not the co-op-safe pattern (autoStart + partyHasClass ${b})`);
    if (!Registry.tryGet('dialogue', `dialogue:${cls}-featured-${b}`)) fail(cls, `missing hook dialogue:${cls}-featured-${b}`);
  }
  if (mine.some((q) => j(q).includes(`"setFlag":"story.bearer.${c.sibling}"`))) fail(cls, `sets the sibling bearer flag (II-5 does that)`);
  // text quality across this class's dialogues
  const dl = dialogues.filter((d) => d.id.startsWith(`dialogue:${cls}-`) || JSON.stringify(d.entries).includes(`"${cls}"`) && d.id.includes(c.school));
  const texts = dl.flatMap((d) => Object.values(d.nodes).flatMap((n) => [n.text, ...(n.choices ?? []).map((ch) => ch.text)]));
  const straight = texts.filter((t) => /\w'\w|'\s|\s'/.test(t)).length;
  const long = texts.filter((t) => t.length > 360).length;
  const holder = texts.filter((t) => /\b(TODO|TBD|placeholder|lorem|FIXME|XXX)\b/i.test(t)).length;
  console.log(`    dialogues ${dl.length}, lines ${texts.length}, straight apostrophes ${straight}, over-long ${long}, placeholders ${holder}`);
  if (holder) fail(cls, `${holder} placeholder lines`);
  if (straight) fail(cls, `${straight} lines with straight apostrophes (use ’)`);
  if (long > 3) fail(cls, `${long} lines over 360 characters (1–3 sentences per node)`);
}
console.log(bad ? `AUDIT: ${bad} issue(s)` : 'AUDIT: clean');
