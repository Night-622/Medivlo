/**
 * Rules invariants (Claude 5, for Claude 3's deeper builds): content-wide properties of the pure rules that must hold
 * whatever the numbers are, so new perks, affixes and runes can't quietly break them. Node only (no sim, no Chrome).
 * Sections: tree (every class and branch), stats (conditions, compile, scalePassive, a content guard), gear (items,
 * sets, legendaries, sockets, Runeforge, paperdoll), affixes (pools: ids, tiers, spell locks, slot coverage), perks (tables fill their slots), keystones (offers, Pack Leader fit) and mastery (one per class weapon), spells (the +72 new kit spells: budgets, ranges, tags).
 * Output like features.ts: failing lines start with "FAIL", the run time is the second-to-last line and the last line
 * is "N/M passed"; process.exitCode = 1 on any failure.
 * Run: node tools/e2e/sim/run.mjs rules-props [section] [classId]
 */
import { check, tally } from './features-harness';
import { affixProps } from './rules-props-affixes';
import { gearAllProps } from './rules-props-gear';
import { keystoneProps } from './rules-props-keystones';
import { perkProps } from './rules-props-perks';
import { newSpellProps } from './rules-props-spells';
import { statsProps } from './rules-props-stats';
import { treeProps } from './rules-props-tree';

const t0 = Date.now();
const [section, only] = process.argv.slice(3);
const run = (name: string, fn: () => void): void => {
  if (section && section !== name) return;
  console.log(`── ${name}`);
  try { fn(); } catch (e) {
    check(false, `${name}: section ran to the end`, `threw ${((e as Error).stack ?? String(e)).replace(/\n/g, ' | ')}`);
  }
};

run('tree', () => treeProps(only));
run('stats', () => statsProps());
run('gear', () => gearAllProps());
run('affixes', () => affixProps());
run('perks', () => perkProps());
run('keystones', () => keystoneProps());
run('spells', () => newSpellProps());

const { checks, fails } = tally();
if (fails) process.exitCode = 1;
console.log(`run time ${((Date.now() - t0) / 1000).toFixed(1)} s — ${fails ? `FAILED (${fails})` : 'OK'}`);
console.log(`${checks - fails}/${checks} passed`);
