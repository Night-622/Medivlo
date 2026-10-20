/**
 * Build simulator + balance gate (Claude 3): measures today's build space through the real authority sim.
 * For all 24 classes at L8 (lair-2), L14 (nemesis) and L34 (Act III): starter (common gear at level, points clicked
 * in tree order) and typical builds, plus "fresh" (creation kit, no tree) at L8 for reference, not gated; in full mode also three archetypes (spell-heavy, melee/attack, tank), six seeded random LEGAL builds and
 * a dead-content A/B of every tree node and kit / school spell. Each build fights a realm pack, a 5-room lair and
 * its campaign boss with the fight.ts bot. Deterministic (seeded Sims and RNGs).
 * GATE: every class's starter AND typical build beats its lair-2, nemesis and Act III bosses, and nothing crashes.
 * Output (tools/release/predeploy-check.mjs): gate lines "ok  " / "FAIL", info lines "# " / "note ", second-to-last
 * line the run time, last line "N/M passed"; process.exitCode = 1 on any gate failure.
 * Run: node tools/e2e/sim/run.mjs builds [quick|full] [classId]     (BUILDS_JSON=<file>: also dump rows as JSON)
 */
import { writeFileSync } from 'node:fs';
import { CLASS_SCHOOL } from '@/core/constants';
import { archetypeBuilds, freshBuild, randomBuild, seedOf, starterBuild, typicalBuild, type Build } from './builds-make';
import { BOSS_SLOT, LEVELS, runBuild, type Level, type Row } from './builds-run';
import { classTable, deadLines, deadSummary, outliers } from './builds-report';
import { deadContent, type ClassDead } from './builds-dead';

const t0 = Date.now();
const args = process.argv.slice(3);
const FULL = args.includes('full');
const ONLY = args.find((a) => a !== 'full' && a !== 'quick');
const RANDOM_N = 6;
const PROBE_LEVEL = 14;
const classes = Object.keys(CLASS_SCHOOL).filter((c) => !ONLY || c === ONLY);
if (!classes.length) { console.log(`FAIL unknown class ${ONLY}`); console.log('run time 0.0 s'); console.log('0/1 passed'); process.exit(1); }

const secs = (): string => ((Date.now() - t0) / 1000).toFixed(1);
const errors: string[] = [];
const rows: Row[] = [];
console.log(`# builds ${FULL ? 'full' : 'quick'}: ${classes.length} classes × L${LEVELS.join('/L')} — ${FULL ? `starter, typical, 3 archetypes, ${RANDOM_N} random each + dead-content A/B at L${PROBE_LEVEL}` : 'starter + typical (+ fresh at L8, not gated)'}`);

function play(b: Build): void {
  try {
    const r = runBuild(b);
    for (const [f, x] of [['pack', r.pack], ['lair', r.lair], ['boss', r.boss]] as const) if (x.crash) errors.push(`${b.cls} L${b.level} ${b.label} ${f}: ${x.crash}`);
    rows.push(r);
  } catch (e) {
    errors.push(`${b.cls} L${b.level} ${b.label}: ${((e as Error).stack ?? String(e)).split('\n').slice(0, 3).join(' | ')}`);
  }
}

classes.forEach((c, ci) => {
  for (const L of LEVELS) {
    if (L === LEVELS[0]) play(freshBuild(c, L)); // the creation kit, for reference (not gated)
    play(starterBuild(c, L));
    play(typicalBuild(c, L));
    if (FULL) {
      for (const b of archetypeBuilds(c, L)) play(b);
      for (let i = 0; i < RANDOM_N; i++) play(randomBuild(c, L, i, seedOf(c, L, 'random', i)));
    }
  }
  if (FULL) console.log(`# progress ${ci + 1}/${classes.length} ${c} fights done (${secs()} s)`);
});

console.log('# ── per class (DPS = damage dealt / s; EHP = max HP / (1 − mitigation seen in the fight); TTK: ✗ = died, T/O = 10 min timeout, lair "XofY" = waves cleared)');
classTable(rows, FULL).forEach((l) => console.log(l));
console.log('# ── outliers');
outliers(rows).forEach((l) => console.log(l));

const dead: ClassDead[] = [];
if (FULL) {
  console.log(`# ── dead content (direct A/B on the typical L${PROBE_LEVEL} build; dead = <2% DPS, <2% survival, <2% EHP and no utility)`);
  // known probe / bot limits (Claude 5): read the list with these in mind
  console.log('#    caveats: survival = share of the net drain cancelled; cooldown cuts can read as a survival LOSS (the bot then casts heals and defensives less often: chooseSlot order);');
  console.log('#    calibration may miss the 45–90 s window for heal-heavy classes (survival jumps across it between multipliers); traps, ground heals at the aim point, slows and other');
  console.log('#    crowd control on the boss bag, and ally buffs (measured solo) are mostly invisible here.');
  classes.forEach((c, ci) => {
    try {
      const d = deadContent(c, PROBE_LEVEL);
      dead.push(d);
      deadLines(d).forEach((l) => console.log(l));
    } catch (e) {
      errors.push(`${c} dead-content probe: ${((e as Error).stack ?? String(e)).split('\n').slice(0, 3).join(' | ')}`);
    }
    console.log(`# progress dead content ${ci + 1}/${classes.length} ${c} (${secs()} s)`);
  });
  deadSummary(dead).forEach((l) => console.log(l));
}

if (process.env.BUILDS_JSON) {
  const slim = rows.map((r) => ({ cls: r.b.cls, level: r.b.level, kind: r.b.kind, label: r.b.label, gear: r.b.gear, points: r.b.points, tree: r.b.save.tree, hotbar: r.b.save.hotbar, pack: r.pack, lair: r.lair, boss: r.boss, bossName: r.bossName }));
  writeFileSync(process.env.BUILDS_JSON, JSON.stringify({ rows: slim, dead }, null, 1));
  console.log(`# wrote ${process.env.BUILDS_JSON}`);
}

// ───────────── gate ─────────────
console.log('# ── GATE: starter and typical builds beat every campaign boss of their level; no crash');
let checks = 0, fails = 0;
const check = (ok: boolean, what: string): void => { checks++; if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); };
for (const c of classes) for (const kind of ['starter', 'typical'] as const) for (const L of LEVELS) {
  const r = rows.find((x) => x.b.cls === c && x.b.level === L && x.b.kind === kind);
  const what = `${c} ${kind} L${L} vs ${BOSS_SLOT[L as Level].label}`;
  if (!r) { check(false, `${what}: build did not run`); continue; }
  const how = r.boss.won ? `won in ${r.boss.secs}s, ${r.boss.hpLeft}% HP left, ${r.boss.potions} potions` : r.boss.crash ? 'crashed' : r.boss.secs >= 600 ? `timeout (600s), boss DPS ${Math.round(r.boss.dealt / 600)}` : `died at ${r.boss.secs}s`;
  check(r.boss.won, `${what} ${r.bossName}: ${how}`);
}
check(!errors.length, `no crash (${rows.length} builds, ${rows.length * (3)} fights${FULL ? ` + ${dead.reduce((a, d) => a + d.items.length, 0)} A/B items` : ''})`);
errors.slice(0, 10).forEach((e) => console.log(`note crash: ${e}`));
if (fails) process.exitCode = 1;
console.log(`run time ${secs()} s — ${fails ? `FAILED (${fails})` : 'OK'}`);
console.log(`${checks - fails}/${checks} passed`);
