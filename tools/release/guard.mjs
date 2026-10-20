// Firebase hosting predeploy guard (Claude 1). Two rules from the user:
// 1. The Hollow Crown ships only when all 24 campaigns are done; test deploys to medivlo.web.app only when the user
//    asks. Deploying hosting therefore needs an explicit flag:  HOLLOW_CROWN_RELEASE=1 firebase deploy --only hosting
// 2. Every deploy must first pass the full pre-deploy test suite (HUD, hitboxes, all features): run
//    node tools/release/predeploy-check.mjs. Its stamp must match the exact source being deployed.
import { existsSync, readFileSync } from 'node:fs';
import { STAMP, sourceHash } from './source-hash.mjs';

if (process.env.HOLLOW_CROWN_RELEASE !== '1') {
  console.error('\n✋ Hosting deploy blocked: The Hollow Crown is not released yet (docs/RELEASE.md).');
  console.error('   Deploying rules only?  firebase deploy --only firestore:rules');
  console.error('   This IS the launch?    HOLLOW_CROWN_RELEASE=1 firebase deploy --only hosting\n');
  process.exit(1);
}
const stamp = existsSync(STAMP) ? JSON.parse(readFileSync(STAMP, 'utf8')) : null;
const now = sourceHash();
if (!stamp || !stamp.ok || stamp.hash !== now.hash) {
  console.error('\n✋ Hosting deploy blocked: the pre-deploy tests have not passed for this exact code.');
  console.error(!stamp ? '   No test stamp found.' : !stamp.ok ? `   Last run (${stamp.at}) FAILED: ${stamp.failed.join(', ')}` : `   The code changed since the last passing run (${stamp.at}).`);
  console.error('   Run:  node tools/release/predeploy-check.mjs   (HUD, hitboxes, spells, upgrades, every feature)\n');
  process.exit(1);
}
console.log(`Release flag set and pre-deploy tests passed (${stamp.at}, ${stamp.passed.length} suites): deploying The Hollow Crown.`);
