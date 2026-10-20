/**
 * Concordia spawn bands by campaign order (Claude 2, with Claude 1 and Claude 3, 2026-10-20). Each class's Act II
 * then Act III quests (walks.ts actWalks), walked across Concordia; a Morvane region's tiers start at the expected
 * level of the host's first quest whose walk passes it and step up at later visits, each from when the host's quest
 * before that visit is done. Expected levels are Claude 5's measured typical player (out/hero-levels.json, walks.ts),
 * which climbs through the side quests too, so every quest in play order is a step: a skipped side's tier just never
 * applies, and the next quest's does (src/world/hc/bands.ts takes the last tier whose step is done).
 *   ENTRY=tools/playthrough/concordiaBands.ts OUT=<file> node tools/playthrough/build.mjs && node <file> <gen|check> [classes]
 *   gen    writes src/data/regions/hc/concordiaBands.gen.ts (all classes; deterministic)
 *   check  every Act II/III walk: band top at that point ≤ expected + 2, and for main quests ≥ expected − 4
 *          (also `checks.ts bands-concordia`; ~3 min, it walks every class across Concordia twice)
 * Act II stays within L14–28 and Act III within L28–40; the Heart keeps its L30 floor.
 */
import { copyFileSync, writeFileSync } from 'node:fs';
import { MORVANE_REGIONS, MORVANE_SCALE } from '@/data/regions/hc/morvane';
import { morvaneRegionAt } from '@/world/hc/overview';
import { spawnZones, zoneLevelAt } from '@/world/hc/spawns';
import type { StepDone } from '@/world/hc/bands';
import { HERO_LEVELS_PIN, HERO_LEVELS_SRC, actWalks, type ActQuestWalk } from './walks';

// direct: <gen|check> [classes]; from checks.ts: bands-concordia [classes]
const mode = process.argv[2] === 'gen' ? 'gen' : 'check', only = process.argv[3];
if (mode === 'gen' && only) throw new Error('gen writes the whole table: run it for every class');
const classes = only?.split(',');

/** a Concordia spawn zone's region (zones, road camps, guards and packs alike: by where it stands) */
const zones = spawnZones('concordia');
const regionOf = new Map(zones.map((z) => [z.id, z.id === 'zone:legion-camp' ? 'region:heart' : morvaneRegionAt(z.at[0] / MORVANE_SCALE, z.at[1] / MORVANE_SCALE)?.id ?? '']));
const isMain = (q: ActQuestWalk) => q.type === 'main' || q.type === 'class';
/** how far over the hero a region not yet visited can be (floor; tops are floor + 2) */
const RAMP = 5;
const ACT_TOP: Record<'act2' | 'act3', number> = { act2: 28, act3: 38 }; // floor caps: band tops ≤ 30 / 40 (the measured hero ends Act II ~L28)

interface Played { cls: string; quests: (ActQuestWalk & { act: 'act2' | 'act3'; stepsBefore: number })[]; steps: string[] }
function played(): Played[] {
  const a2 = actWalks('act2', classes), a3 = actWalks('act3', classes);
  return a2.map((w) => {
    const all = [...w.quests.map((q) => ({ ...q, act: 'act2' as const })), ...(a3.find((x) => x.cls === w.cls)?.quests ?? []).map((q) => ({ ...q, act: 'act3' as const }))];
    const quests = all.map((q, i) => ({ ...q, stepsBefore: i }));
    return { cls: w.cls, quests, steps: all.map((q) => q.quest) };
  });
}

const walks = played();
if (mode === 'gen') {
  const table: Record<string, Record<string, { floor: number; step?: number }[]>> = {};
  // story instances (Sentinel lairs, the barrow, the abbey): fought at the level a class's hero enters them (first
  // entry); Morvane caves follow their region and the citadel keeps its finale level
  const inst: Record<string, Record<string, number>> = {};
  for (const w of walks) for (const q of w.quests) for (const id of q.lairs) {
    if (!/^inst:(sentinel-[a-z]+|varric-barrow|drowned-abbey)$/.test(id) || inst[id]?.[w.cls] !== undefined) continue;
    (inst[id] ??= {})[w.cls] = Math.max(1, Math.min(ACT_TOP[q.act], Math.floor(q.expected)));
  }
  for (const w of walks) {
    const visits = new Map<string, { floor: number; step: number }[]>();
    for (const q of w.quests) for (const id of new Set([...q.zones, ...q.ftZones])) {
      const region = regionOf.get(id);
      if (!region) continue;
      let floor = Math.min(ACT_TOP[q.act], Math.floor(q.expected));
      if (region === 'region:heart') floor = Math.max(30, floor);
      visits.set(region, [...(visits.get(region) ?? []), { floor, step: q.stepsBefore }]);
    }
    table[w.cls] = {};
    for (const [region, v] of [...visits].sort(([a], [b]) => a.localeCompare(b))) {
      // visits in play order (floors only rise): the first holds from the start; each later one that is higher
      // and comes after a later quest becomes a tier from that quest (a visit during the same quest keeps the lower floor)
      const list: { floor: number; step?: number }[] = [];
      let lastStep = -1;
      // before the first visit the region ramps with the hero, at most RAMP over them (it was the first visit's
      // level from the start: an L16 hero off the route met L30 next door). Not the Heart (sealed, its L30 rule).
      const first = v[0];
      if (region !== 'region:heart' && first.step > 0) {
        const at = (k: number) => Math.min(first.floor, Math.floor(w.quests[k].expected) + RAMP);
        list.push({ floor: at(0) });
        for (let k = 1; k < first.step; k++) if (at(k) > list[list.length - 1].floor) list.push({ floor: at(k), step: k });
        lastStep = list.length > 1 ? list[list.length - 1].step! : -1;
      }
      for (const x of v) {
        if (!list.length) { list.push({ floor: x.floor }); lastStep = x.step; continue; }
        if (x.floor <= list[list.length - 1].floor || x.step <= lastStep) continue;
        list.push({ floor: x.floor, step: x.step });
        lastStep = x.step;
      }
      table[w.cls][region] = list;
    }
  }
  const tier = (t: { floor: number; step?: number }) => (t.step ? `{ floor: ${t.floor}, step: ${t.step} }` : `{ floor: ${t.floor} }`);
  const rows = Object.keys(table).sort().map((c) => `  ${c}: {\n${Object.entries(table[c]).map(([r, t]) => `    '${r}': [${t.map(tier).join(', ')}],`).join('\n')}\n  },`);
  const mains = [...walks].sort((a, b) => a.cls.localeCompare(b.cls)).map((w) => `  ${w.cls}: [${w.steps.map((m) => `'${m}'`).join(', ')}],`);
  writeFileSync('src/data/regions/hc/concordiaBands.gen.ts', `/**
 * GENERATED by tools/playthrough/concordiaBands.ts gen (Claude 2): do not edit. Concordia spawn bands by campaign
 * order: host class → Morvane region → tiers (\`floor\`; a later tier applies once the host's Act II/III quest
 * \`step\` is done, counting in ACT23_MAINS: every quest in play order, the measured hero climbs through the sides too). Zones spawn at floor…floor+2, road camps and guards floor…floor+1,
 * ruin packs floor+1…floor+2 (elite). See src/world/hc/bands.ts.
 */
import type { ZoneTier } from './zoneBands.gen';

export const CONCORDIA_BANDS: Record<string, Record<string, ZoneTier[]>> = {
${rows.join('\n')}
};

/** Story instances (Sentinel lairs, the barrow, the abbey) → class → the level its packs fight at for that host (the
 * measured hero level on first entry); hosts that never enter keep the instance's own level. */
export const INSTANCE_BANDS: Record<string, Record<string, number>> = {
${Object.keys(inst).sort().map((i) => `  '${i}': { ${Object.entries(inst[i]).sort(([a], [b]) => a.localeCompare(b)).map(([c, f]) => `${c}: ${f}`).join(', ')} },`).join('\n')}
};

/** Each class's Act II then Act III quests, in play order (step n = the n-th; mains, class thread and sides alike). */
export const ACT23_MAINS: Record<string, string[]> = {
${mains.join('\n')}
};
`);
  // pin the hero levels these bands came from: the check (and the walk exports) read the pin, not Claude 5's live file
  if (HERO_LEVELS_SRC !== HERO_LEVELS_PIN) copyFileSync(HERO_LEVELS_SRC, HERO_LEVELS_PIN);
  console.log(`wrote src/data/regions/hc/concordiaBands.gen.ts: ${Object.keys(table).length} classes × ${MORVANE_REGIONS.length} regions at most (hero levels pinned in ${HERO_LEVELS_PIN})`);
} else {
  const byId = new Map(zones.map((z) => [z.id, z]));
  let bad = 0;
  const stats = { mains: [] as number[], all: 0, low: 0, high: 0, heart: -99 };
  for (const w of walks) {
    let worstHigh = { m: -99, what: '' }, worstLow = { m: 99, what: '' }, over = 0, under = 0;
    for (const q of w.quests) {
      const done: StepDone = (_c, step) => step <= q.stepsBefore;
      for (const id of new Set([...q.zones, ...q.ftZones])) {
        const z = byId.get(id);
        if (!z) continue;
        const [, hi] = zoneLevelAt(z, done, w.cls), m = hi - q.expected;
        stats.all++;
        const what = `${q.quest.replace('quest:', '')} (L${q.expected}) passes ${id} top L${hi}`;
        // the Heart keeps its L30 floor (Claude 1), so early Act III quests meet it up to L32: not an overshoot
        if (regionOf.get(id) === 'region:heart') { stats.heart = Math.max(stats.heart, m); continue; }
        if (m > worstHigh.m) worstHigh = { m, what };
        if (m > 2) { over++; stats.high++; }
        if (isMain(q)) {
          stats.mains.push(m);
          if (m < worstLow.m) worstLow = { m, what };
          if (m < -4) { under++; stats.low++; }
        }
      }
    }
    if (over || under) bad++;
    console.log(`${w.cls.padEnd(12)} worst +${worstHigh.m.toFixed(1)}${over ? ` (${over} over +2)` : ''} / mains lowest ${worstLow.m.toFixed(1)}${under ? ` (${under} under −4)` : ''}  ${under ? worstLow.what : worstHigh.what}`);
  }
  const s = stats.mains.sort((a, b) => a - b), q = (p: number) => s[Math.floor(p * (s.length - 1))]?.toFixed(1);
  console.log(`main-quest passes: band top − expected p10 ${q(0.1)} median ${q(0.5)} p90 ${q(0.9)}; over +2: ${stats.high}/${stats.all}; mains under −4: ${stats.low}/${s.length}`);
  const pub = zones.filter((z) => z.byClass).map((z) => zoneLevelAt(z, () => false, null)[1]);
  console.log(`the Heart (L30 floor): at most +${stats.heart.toFixed(1)} over the expected level`);
  console.log(`public realms (no host class): band tops L${Math.min(...pub)}–${Math.max(...pub)}`);
  if (bad) process.exitCode = 1;
  console.log(bad ? `bands-concordia: ${bad} classes outside expected −4…+2` : 'bands-concordia: every Act II/III walk within expected + 2, and main quests within expected − 4');
}
