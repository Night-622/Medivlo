/** Claude 3 hand-off: every story gift given with a stand-in item (giveItem next to a <class>.* flag), plus pet/mount flags (Claude 4). */
import { Registry } from '@/core';
import type { DialogueDef } from '@/core';
type Eff = { giveItem?: string; setFlag?: string; value?: unknown };
const out: string[] = [];
const petFlags = new Set<string>();
for (const d of Registry.all('dialogue') as DialogueDef[]) for (const [nid, n] of Object.entries(d.nodes)) {
  const lists: { effs: Eff[]; text: string }[] = [{ effs: (n.effects ?? []) as Eff[], text: n.text }];
  for (const c of n.choices ?? []) lists.push({ effs: (c.effects ?? []) as Eff[], text: c.text });
  for (const { effs, text } of lists) {
    for (const e of effs) if (e.setFlag && /_(pet|mount)$/.test(e.setFlag)) petFlags.add(`${e.setFlag}\t(${d.id}#${nid})`);
    const items = effs.filter((e) => e.giveItem).map((e) => e.giveItem!);
    if (!items.length) continue;
    const flags = effs.filter((e) => e.setFlag && !/farewell|_done|_thanked/.test(e.setFlag)).map((e) => e.setFlag!);
    const speaker = String(n.speaker ?? '').replace(/^npc:/, '');
    out.push(`${items.join('+')}\t${flags.join(',') || '-'}\t${speaker}\t${d.id}#${nid}\t“${text.replace(/\s+/g, ' ').slice(0, 110)}”`);
  }
}
for (const l of out.sort((a, b) => a.split('\t')[1].localeCompare(b.split('\t')[1]))) console.log(l);
console.log(`--- pet/mount flags (${petFlags.size})`); for (const p of petFlags) console.log(p);
console.log(`total gifts ${out.length}`);
