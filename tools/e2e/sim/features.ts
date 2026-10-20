/**
 * Pre-deploy features gate (Claude 3): every class's hotbar 1–4, dash and potions through real InputFrames; the
 * skill tree (every node, keystones, branch reset); gear, sets, Attuned and legendaries; level-ups, shops, the
 * Runeforge and scrolls — all through the authority sim (src/systems/sim) and rules (src/systems/rules).
 * Seeded and deterministic: asserts on events and state, never on damage rolls.
 * Output (tools/release/predeploy-check.mjs): failing lines start with "FAIL", the run time is the second-to-last
 * line and the last line is "N/M passed"; process.exitCode = 1 on any failure.
 * Run: node tools/e2e/sim/run.mjs features [section] [classId]   (sections: casts, tree, gear, progress, hooks, slash, facing, builds, lifecycle, affixes, runes)
 */
import { castChecks } from './features-casts';
import { gearChecks } from './features-gear';
import { check, tally } from './features-harness';
import { progressChecks } from './features-progress';
import { treeChecks } from './features-tree';
import { hookChecks } from './features-hooks';
import { slashChecks } from './features-slash';
import { facingChecks } from './features-facing';
import { buildChecks } from './features-builds';
import { lifecycleChecks } from './features-lifecycle';
import { affixChecks } from './features-affixes';
import { runeChecks } from './features-runes';

const t0 = Date.now();
const [section, only] = process.argv.slice(3);
const run = (name: string, fn: () => void): void => {
  if (section && section !== name) return;
  console.log(`── ${name}`);
  try { fn(); } catch (e) {
    check(false, `${name}: section ran to the end`, `threw ${((e as Error).stack ?? String(e)).replace(/\n/g, ' | ')}`);
  }
};

run('casts', () => castChecks(only));
run('tree', () => treeChecks(only));
run('gear', () => gearChecks());
run('progress', () => progressChecks());
run('hooks', () => hookChecks());
run('slash', () => slashChecks(only));
run('facing', () => facingChecks());
run('builds', () => buildChecks());
run('lifecycle', () => lifecycleChecks());
run('affixes', () => affixChecks());
run('runes', () => runeChecks());

const { checks, fails } = tally();
if (fails) process.exitCode = 1;
console.log(`run time ${((Date.now() - t0) / 1000).toFixed(1)} s — ${fails ? `FAILED (${fails})` : 'OK'}`);
console.log(`${checks - fails}/${checks} passed`);
