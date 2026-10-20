/**
 * Sparse-class spots (Claude 2, for Claude 1 and Claude 4): where a story-bound pack or a "clear the camp" stage
 * would fit in the class threads that pass the fewest encounters. For each class-thread quest of the given classes
 * and act: its kill slots now (fast-travel walk, out/actN-walks.json), and each open-world objective spot with
 * whether it is wild ground (not a village or safe ground) and how many spawn zones already reach it.
 *   ENTRY=tools/playthrough/sparseSpots.ts OUT=<file> node tools/playthrough/build.mjs && node <file> <act2|act3> <classes>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { Game, Registry, createNewGameState, type NpcDef, type QuestDef } from '@/core';
import { spaceRuntime } from '@/world/hc/spaces';
import { spawnZones } from '@/world/hc/spawns';
import { morvaneRegionAt } from '@/world/hc/overview';
import { MORVANE_SCALE, MORVANE_VILLAGES } from '@/data/regions/hc/morvane';
import { where } from './places';
import { AGGRO_TILES } from './walks';

const [act = 'act2', list = ''] = process.argv.slice(2);
Game.set(createNewGameState());
Registry.load();
const npcs = new Map((Registry.all('npc') as NpcDef[]).map((n) => [n.id, n]));
const quests = new Map((Registry.all('quest') as QuestDef[]).map((q) => [q.id as string, q]));
const walks = JSON.parse(readFileSync(`tools/playthrough/out/${act}-walks.json`, 'utf8')) as Record<string, { quest: string; campaign: string; type: string; zones: { cap: number }[] }[]>;
const g = spaceRuntime('concordia').gen as unknown as { zoneRule(x: number, y: number): string };
const zones = spawnZones('concordia');
/** hubs where a fight would be out of place: villages, the Gate Circle, the Heart camp (25 tiles round) */
const hubs = [...MORVANE_VILLAGES.map((v) => v.at), where('landmark:gate-circle')?.at, where('landmark:heart-camp')?.at].filter(Boolean) as [number, number][];
const nearHub = (p: [number, number]) => hubs.some((h) => Math.hypot(h[0] - p[0], h[1] - p[1]) < 25);
const lines: string[] = [`# Sparse class threads, ${act === 'act2' ? 'Act II' : 'Act III'}: spots for a story-bound pack`, ''];
lines.push('Kill slots are fast-travel walk caps per quest (out/' + act + '-walks.json). A spot is a candidate when it is wild ground, not within 25 tiles of a village, the Gate Circle or the Heart camp, and at most one spawn zone reaches it.', '');
for (const cls of list.split(',').filter(Boolean)) {
  const qs = (walks[cls] ?? []).filter((q) => q.campaign === cls);
  const total = (walks[cls] ?? []).reduce((a, q) => a + q.zones.reduce((b, z) => b + z.cap, 0), 0);
  lines.push(`## ${cls} (act total ${total}; class thread ${qs.reduce((a, q) => a + q.zones.reduce((b, z) => b + z.cap, 0), 0)})`, '');
  for (const w of qs) {
    const qd = quests.get(w.quest);
    if (!qd) continue;
    const slots = w.zones.reduce((b, z) => b + z.cap, 0);
    const spots: string[] = [];
    for (const st of qd.stages) for (const o of st.objectives as Record<string, any>[]) {
      if (o.optional || o.kill) continue;
      const id = o.talk ? npcs.get(o.talk)?.home : o.interact ?? o.reach ?? o.marker?.landmark;
      if (!id) continue;
      const s = where(String(id).replace('*', '1'));
      if (!s || s.space !== 'concordia') continue;
      const rule = g.zoneRule(s.at[0], s.at[1]);
      const reach = zones.filter((z) => Math.hypot(z.at[0] - s.at[0], z.at[1] - s.at[1]) <= z.r + AGGRO_TILES).length;
      const region = morvaneRegionAt(s.at[0] / MORVANE_SCALE, s.at[1] / MORVANE_SCALE)?.name ?? '?';
      const fit = rule !== 'wild' ? `${rule} ground` : nearHub(s.at) ? 'by a village or hub' : reach <= 1 ? '**candidate**' : `${reach} zones already`;
      spots.push(`  - stage \`${st.id}\` · ${String(id)} (${region}, ${s.at.join(',')}): ${fit}`);
    }
    lines.push(`- ${qd.name} (\`${w.quest}\`, ${qd.type}): ${slots} slots now`, ...(spots.length ? spots : ['  - (no open-world objective spots: talk-only, or inside an instance)']));
  }
  lines.push('');
}
const file = `tools/playthrough/out/sparse-spots-${act}.md`;
writeFileSync(file, lines.join('\n') + '\n');
console.log(`wrote ${file}`);
