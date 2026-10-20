#!/usr/bin/env node
/**
 * Reduced motion: every motion effect in the game must honour Settings.reduceMotion (Settings › Accessibility).
 * Owner: Claude 6. Static and instant: each effect site's file must read `reduceMotion`, so a later edit can't
 * silently drop it. Add a line here whenever a new shake, bob, pulse or flicker is added anywhere.
 *
 *   node tools/e2e/integrity-motion.mjs        exit 0 = every listed effect reads the setting
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
/** [file, effect, owner] */
const EFFECTS = [
  ['src/systems/view/fx.ts', 'camera shake on hits and crits; hit flash; damage-number pop', 'Claude 3'],
  ['src/systems/view/CombatView.ts', 'loot bob, attack/cast squash, downed ▼ bounce', 'Claude 3'],
  ['src/ui/map/mapQuests.ts', 'pulsing quest-mark rings on the map', 'Claude 2'],
  ['src/world/render/Lighting.ts', 'lamp flicker', 'Claude 2'],
  ['src/ui/screens/SettingsScene.ts', 'the Settings › Accessibility toggle itself', 'Claude 6'],
];
let fails = 0;
for (const [file, what, owner] of EFFECTS) {
  let ok = false;
  try { ok = /\breduceMotion\b/.test(readFileSync(join(root, file), 'utf8')); } catch { /* missing file */ }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}: ${what}${ok ? '' : `  (does not read reduceMotion; ${owner})`}`);
  if (!ok) fails++;
}
// and the setting exists, defaulting to off
const core = readFileSync(join(root, 'src/core/settings.ts'), 'utf8');
const def = /reduceMotion:\s*false/.test(core) && /reduceMotion:\s*boolean/.test(core);
console.log(`${def ? 'PASS' : 'FAIL'}  src/core/settings.ts: reduceMotion is a setting, off by default`);
if (!def) fails++;
console.log(fails ? `\nintegrity-motion: ${fails} FAILED` : '\nintegrity-motion: ALL PASS');
process.exit(fails ? 1 : 0);
