// World pre-deploy suite (Claude 2): builds tools/playthrough/checks.ts once and runs the fast world checks, each in
// its own Node process; exits non-zero if any fails. About 25 s (reach floods every space, ~13 s). `--full` adds bands-concordia (~4 min).
//   node tools/playthrough/suite.mjs [--full]
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const FAST = ['unplaced', 'pieces', 'instances', 'bands', 'class-objects', 'clearance', 'merchants', 'loot', 'reach'];
const checks = process.argv.includes('--full') ? [...FAST, 'bands-concordia'] : FAST;
const out = join(mkdtempSync(join(process.env.SCRATCH ?? tmpdir(), 'world-suite-')), 'checks.mjs');
execFileSync(process.execPath, ['tools/playthrough/build.mjs'], { env: { ...process.env, ENTRY: 'tools/playthrough/checks.ts', OUT: out }, stdio: 'ignore' });
let failed = 0;
for (const c of checks) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [out, c], { encoding: 'utf8' });
  const lines = (r.stdout ?? '').split('\n').filter((l) => l && !l.startsWith('[registry]') && !l.startsWith('[world]'));
  const ok = r.status === 0;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${c.padEnd(16)} ${((Date.now() - t0) / 1000).toFixed(1)} s  ${lines[lines.length - 1] ?? ''}`);
  if (!ok) for (const l of [...lines.slice(0, 12), ...(r.stderr ?? '').split('\n').slice(0, 6)]) if (l) console.log(`     ${l}`);
}
console.log(failed ? `world suite: ${failed} of ${checks.length} failed` : `world suite: all ${checks.length} passed`);
process.exit(failed ? 1 : 0);
