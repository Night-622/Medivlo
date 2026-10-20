/**
 * Headless hitbox gate (Claude 3): hero attacks and spells, creature telegraphs and shots, dash i-frames and PvP,
 * all through the real authority sim (src/systems/sim); plus a body-radius vs art report (never fails).
 * Run: node tools/e2e/sim/run.mjs hitboxes [hero|creature|dash|pvp|art]   (HB_DETAIL=n: detail lines per FAIL)
 *
 * Output contract (tools/release/predeploy-check.mjs): failing lines start with "FAIL", passing with "ok  ",
 * informational with "note " or "# ", the run time on the line before the last, the last line "N/M passed".
 */
import { creatureSection } from './hitboxes-creature';
import { artSection } from './hitboxes-art';
import { Findings, tally } from './hitboxes-harness';
import { heroSection } from './hitboxes-hero';
import { dashSection, pvpSection } from './hitboxes-pvp';

const t0 = Date.now();
const f = new Findings();
const only = process.argv[3];
const want = (s: string) => !only || only === s;

if (want('hero')) {
  const skipped = heroSection(f);
  console.log(`# no hostile shape (buffs, heals, summons, walls, decoys), not probed: ${skipped.length}: ${skipped.join(' ')}`);
}
if (want('creature')) creatureSection(f);
if (want('dash')) dashSection(f);
if (want('pvp')) pvpSection();

console.log('# rules checked across all cases');
f.report('travel', 'dashes, charges and leaps travel their stated distance (within one tick)');
f.report('range', 'hero spells aimed at an enemy do nothing to a clicked target beyond the spell range');
f.report('edge', 'cones and melee arcs strike a body that overlaps their angular edge (not only its centre)');
f.report('dodge', 'creature attacks resolve where they were telegraphed: a hero who moved out is not hit');
f.report('userange', 'a creature only starts an ability from where it can land on a hero who stands still');
f.report('noop', 'every creature attack ability does something to a hero it reaches');
f.report('telegraph', 'enemy:telegraph shows the shape and size that deals the damage');

if (want('art')) artSection();

const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`result: ${tally.fails ? `FAILED (${tally.fails})` : 'OK'} - ${tally.checks} checks, ${tally.probes} probe worlds, run time ${secs} s`);
console.log(`${tally.checks - tally.fails}/${tally.checks} passed`);
if (tally.fails) process.exitCode = 1;
