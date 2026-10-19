/**
 * Beat spread (Claude 2, docs/PACING.md pass 3): where each class's Act I objectives sit, measured from the class's
 * home village: town (< 20 tiles), near (< 60), far (60+), inside an instance, elsewhere (another space), or not
 * resolvable. A campaign whose beats are mostly "town" walks little; this shows which ones to spread.
 *   ENTRY=tools/playthrough/spread.ts OUT=/tmp/spread.mjs node tools/playthrough/build.mjs && node /tmp/spread.mjs [classes]
 */
import { Game, Registry, createNewGameState, type NpcDef, type QuestDef } from '@/core';
import { AREAS, spaceRuntime } from '@/world/hc/spaces';
import type { RealmGen } from '@/world/hc/realmGen';
import { where, whereCreature, type Spot } from './places';

Game.set(createNewGameState());
Registry.load();

const npcs = new Map((Registry.all('npc') as NpcDef[]).map((n) => [n.id, n]));
const quests = Registry.all('quest') as QuestDef[];
const want = process.argv[2]?.split(',');
const classes = [...new Set(AREAS.map((a) => a.className?.toLowerCase()).filter(Boolean))].filter((c) => !want || want.includes(c!)) as string[];

type Bucket = 'town' | 'near' | 'far' | 'inst' | 'elsewhere' | 'unresolved';
const rows: string[] = [];
const worst: [string, number][] = [];
for (const cls of classes) {
  const area = AREAS.find((a) => a.className?.toLowerCase() === cls)!;
  const space = `realm:${area.school}`;
  const hub = (spaceRuntime(space).gen as RealmGen).villages.find((v) => v.id === `vil:${area.school}-${area.side}`)!.at;
  const n: Record<Bucket, number> = { town: 0, near: 0, far: 0, inst: 0, elsewhere: 0, unresolved: 0 };
  const lost: string[] = [];
  for (const qd of quests.filter((q) => q.campaign === cls && (q as { act?: string }).act === 'act1')) {
    for (const st of qd.stages) for (const o of st.objectives as Record<string, any>[]) {
      if (o.optional) continue;
      let spot: Spot | null = null;
      if (o.talk) { const home = npcs.get(o.talk)?.home; spot = home ? where(home) : null; }
      else if (o.interact) spot = where(String(o.interact).replace('*', '1').replace(/-$/, '-1'));
      else if (o.reach) spot = where(o.reach);
      else if (o.kill) spot = (o.marker && where(o.marker.landmark ?? o.marker.place ?? o.marker.region)) || whereCreature(String(o.kill), cls);
      else if (o.marker) spot = where(o.marker.landmark ?? o.marker.place ?? o.marker.region);
      else continue; // flag-only objectives (`when` without a marker) have no place
      let b: Bucket;
      if (!spot) { b = 'unresolved'; lost.push(o.talk ?? o.interact ?? o.reach ?? o.kill); }
      else if (spot.space.startsWith('inst:')) b = 'inst';
      else if (spot.space !== space) b = 'elsewhere';
      else { const d = Math.hypot(spot.at[0] - hub[0], spot.at[1] - hub[1]); b = d < 20 ? 'town' : d < 60 ? 'near' : 'far'; }
      n[b]++;
    }
  }
  const total = Object.values(n).reduce((a, b) => a + b, 0) || 1;
  worst.push([cls, n.town / total]);
  rows.push(`${cls.padEnd(13)} ${String(total).padStart(3)} beats  town ${pct(n.town, total)}  near ${pct(n.near, total)}  far ${pct(n.far, total)}  inst ${pct(n.inst, total)}  elsewhere ${n.elsewhere}  unresolved ${n.unresolved}${lost.length ? ` (${lost.slice(0, 4).join(', ')})` : ''}`);
}
console.log(rows.join('\n'));
console.log('most town-bound:', worst.sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c, f]) => `${c} ${Math.round(f * 100)}%`).join(', '));

function pct(a: number, t: number): string { return `${String(Math.round((a / t) * 100)).padStart(3)}%`; }
