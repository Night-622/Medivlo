/** Print a class's quests as stage outlines (Claude 4 depth-pass aid): CLASS=arcanist ACT=act1 */
import { Registry } from '@/core';
import type { QuestDef } from '@/core';
const cls = process.env.CLASS ?? 'arcanist', act = process.env.ACT ?? 'act1';
for (const q of (Registry.all('quest') as QuestDef[]).filter((x) => (x.campaign === cls || (cls === 'shared' && !x.campaign && x.id.startsWith(process.env.PREFIX ?? 'quest:cc-'))) && x.act === act)) {
  console.log(`${q.type.padEnd(6)} ${q.id.slice(6)} "${q.name}" giver=${q.giver?.slice(4) ?? '-'}`);
  for (const s of q.stages) console.log(`    ${s.id}: ${s.objectives.map((o) => o.id + '[' + Object.keys(o).filter((k) => ['talk', 'kill', 'collect', 'reach', 'interact', 'when'].includes(k))[0] + ':' + JSON.stringify((o as never)[Object.keys(o).filter((k) => ['talk', 'kill', 'collect', 'reach', 'interact', 'when'].includes(k))[0]]).slice(0, 50) + ']').join(' ')}`);
}
