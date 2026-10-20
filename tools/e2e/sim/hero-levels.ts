/**
 * Hero level at the start of each quest (Claude 5 for Claude 2, 2026-10-21): the gear-curve typical player's walk
 * (gear-curve-walk.ts: mains, sides and bounties on xp-project's route, Claude 2's walk exports, lairs, the optional
 * realm / Morvane ruins and caves), median over seeds. Claude 2's bands.ts / concordiaBands.ts read it as the expected
 * level per quest.
 *   node tools/e2e/sim/run.mjs hero-levels [classId…]      → tools/playthrough/out/hero-levels.json
 *   SEEDS=n (default 5) · OPT=0 skips the optional sites (as gear-curve)
 */
import { writeFileSync } from 'node:fs';
import { CLASS_SCHOOL } from '@/core/constants';
import { questsOf, runClass } from './gear-curve-walk';

const SEEDS = Number(process.env.SEEDS) || 5;
const args = process.argv.slice(3);
const CLASSES = args.length ? args : Object.keys(CLASS_SCHOOL);
const median = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const out: Record<string, Record<string, number>> = {};
for (const cls of CLASSES) {
  const own = await questsOf(cls);
  const at = new Map<string, number[]>();
  for (let k = 0; k < SEEDS; k++) runClass(cls, 101 + 17 * k, own, [], undefined, (q, L) => at.set(q, [...(at.get(q) ?? []), L]));
  out[cls] = Object.fromEntries([...at].map(([q, ls]) => [q, Math.round(median(ls) * 10) / 10]));
  const v = Object.values(out[cls]);
  console.log(`${cls.padEnd(12)} ${v.length} quests · L${v[0]} → L${v[v.length - 1]}`);
}
writeFileSync('tools/playthrough/out/hero-levels.json', JSON.stringify(out, null, 1) + '\n');
console.log('wrote tools/playthrough/out/hero-levels.json');
