/** Claude 2 hand-off: every id the validator reports unplaced, with where the data says it belongs (Claude 4). */
import { Registry } from '@/core';
import type { QuestDef } from '@/core';
import { validateContent } from '@/narrative/engine/validate';
import { installHcValidationSource } from '@/narrative/client/validationSources';
installHcValidationSource();
const world = validateContent().filter((x) => x.startsWith('[world]'));
if (process.env.RAW) { for (const x of world.slice(0, 15)) console.log(x); process.exit(0); }
// "[world] <quest>#<stage>: <kind> "<id>" not placed" → the objective's marker says where (Act III: twelve-stairs-top, legion-camp, heart-camp)
const rows = new Map<string, { kind: string; where: string; who: string }>();
for (const line of world) {
  const m = /^\[world\] ([^#:]+:[^#]+)#?([^:]*): (\w+) "([^"]+)"/.exec(line);
  if (!m) { rows.set(line, { kind: '?', where: '?', who: '' }); continue; }
  const [, owner, stage, kind, id] = m;
  if (rows.has(id) || /-\d+$/.test(id) && rows.has(id.replace(/-\d+$/, '-*'))) continue;
  let where = '';
  const q = Registry.tryGet('quest', owner as never) as QuestDef | undefined;
  const o = q?.stages.find((s) => s.id === stage)?.objectives.find((x) => (x as { interact?: string; reach?: string }).interact === id || (x as { reach?: string }).reach === id) as { marker?: Record<string, string>; count?: number } | undefined;
  if (o?.marker) where = Object.values(o.marker)[0] + (o.count && o.count > 1 ? ` ×${o.count}` : '');
  const npc = id.startsWith('npc:') ? Registry.tryGet('npc', id as never) as { home?: string; region?: string } | undefined : undefined;
  if (npc) where = `${npc.home ?? ''} (${npc.region ?? ''})`;
  rows.set(id, { kind, where: where || (q ? String(q.region ?? '') : ''), who: owner });
}
for (const [id, r] of [...rows].sort((a, b) => a[1].where.localeCompare(b[1].where))) console.log(`${id}\t${r.kind}\t@ ${r.where}\t(${r.who})`);
console.log(`total ${rows.size}`);
