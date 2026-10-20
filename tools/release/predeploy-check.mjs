// Pre-deploy test suite (Claude 1). The user's rule (2026-10-20): every deploy first proves that the HUD works,
// that enemy and player hitboxes work, and that every feature (spells, upgrades, gear, shops, story) works.
// Runs every suite below, one after another (one headless Chrome at a time), and writes a stamp holding the source
// fingerprint. tools/release/guard.mjs refuses a hosting deploy unless that stamp passed for the exact same code.
//   node tools/release/predeploy-check.mjs            full run (about 15–25 min), writes the stamp
//   node tools/release/predeploy-check.mjs --list     show the suites
//   node tools/release/predeploy-check.mjs --only hud,hc-panels   debug a few suites (never writes a stamp)
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, STAMP, sourceHash } from './source-hash.mjs';
import { reserveChrome } from '../e2e/chrome-lock.mjs';

const BASE = 'http://localhost:5190'; // our own no-HMR test server (other agents use 5196–5199)
const REALM = 'http://localhost:8080'; // the DEV client looks for the realm server here
const LOGS = join(ROOT, 'tools/e2e/out/predeploy');
const NODE = process.execPath;
const BASH = [process.env.SHELL, 'C:/Program Files/Git/bin/bash.exe'].find((p) => p && /bash(\.exe)?$/.test(p) && existsSync(p)) ?? 'bash';
const tsc = [NODE, 'node_modules/typescript/bin/tsc', '--noEmit'];
const sim = (name, ...args) => [NODE, 'tools/e2e/sim/run.mjs', name, ...args];
const e2e = (file, ...args) => [NODE, `tools/e2e/${file}`, ...args];

/** what: what the suite proves (shown in the report). needs: servers it uses. file: a test that must exist. */
const SUITES = [
  { id: 'typecheck', what: 'TypeScript strict, 0 errors', cmd: tsc },
  { id: 'typecheck-server', what: 'TypeScript strict for the realm server (server/), 0 errors', cmd: [...tsc, '-p', 'tsconfig.server.json'] },
  { id: 'build-server', what: 'realm server build (dist-server), so every realm suite tests this exact code', cmd: [NODE, 'server/build.mjs'] },
  { id: 'build', what: 'production build', cmd: [NODE, 'node_modules/vite/bin/vite.js', 'build'] },
  { id: 'sim-validate', what: 'content: spells, kits, trees, creatures, drops', cmd: sim('validate') },
  { id: 'sim-hitboxes', what: 'enemy + player hitboxes: hits inside reach/shape, misses outside, bodies match sprites', cmd: sim('hitboxes'), file: 'tools/e2e/sim/hitboxes.ts', owner: 'Claude 3' },
  { id: 'sim-features', what: 'every class: spells 1–4, dash, potions, skill tree, gear + sets, legendaries, level-up, shop, Runeforge', cmd: sim('features'), file: 'tools/e2e/sim/features.ts', owner: 'Claude 3' },
  { id: 'rules-props', what: 'rules invariants: trees, stat engine, gear/sets/Runeforge/paperdoll, affixes, perks, keystones, mastery', cmd: sim('rules-props'), file: 'tools/e2e/sim/rules-props.ts', owner: 'Claude 3 + Claude 5' },
  { id: 'builds', what: 'balance gate: every class, starter and typical build, beats its lair-2, nemesis and Act III bosses', cmd: sim('builds'), owner: 'Claude 3' },
  { id: 'sim-coop', what: 'co-op + PvP rules, downed/revive, loot, escorts', cmd: sim('coop') },
  { id: 'coop-balance', what: 'co-op balance: every party fight won, parties beat solo on bosses by ×1.2+, revives land under heavy damage', cmd: sim('coop-balance', 'gate'), owner: 'Claude 5' },
  { id: 'boss-check', what: 'every campaign boss beaten at a typical player’s gear: 0 deaths, no fight over 300 s (documented allowances)', cmd: sim('boss-check', 'gate'), owner: 'Claude 5' },
  { id: 'realm-perf', what: 'realm scale: 25 heroes in one space tick under 16 ms (p99) and snapshots stay under 22 KB per viewer', cmd: sim('realm-perf'), owner: 'Claude 3' },
  { id: 'sim-economy', what: 'quest rewards, shops, chests, Runeforge prices', cmd: sim('economy') },
  { id: 'sim-security', what: 'remote loadouts sanitised', cmd: sim('security') },
  { id: 'sim-hazards', what: 'boss arena hazards', cmd: sim('hazards') },
  { id: 'world', what: 'world: every object placed, instances build, level bands (realms + Concordia), class objects, boss/pack clearance', cmd: [NODE, 'tools/playthrough/suite.mjs', '--full'] },
  { id: 'narrative', what: 'story gate (Jester + Shade): validator, solo + co-op bots, audit', cmd: [BASH, 'tools/narrative/check.sh', 'jester,shade', '2'],
    judge: (out) => /LOGIC problems: 0/.test(out) && /tsc: clean/.test(out) && !/\bFAIL\b/.test(out) },
  { id: 'dialogue-esc', what: 'closing a conversation early (Esc) still applies the effects of every skipped line', cmd: e2e('qa-dialogue-esc.mjs'), file: 'tools/e2e/qa-dialogue-esc.mjs', owner: 'Claude 7' },
  { id: 'integrity-net', what: 'accounts survive start-up, co-op rejoin on the real signalling rules, seats, blocks, leave without a fake kick', cmd: e2e('integrity-net.mjs'), file: 'tools/e2e/integrity-net.mjs', owner: 'Claude 6' },
  { id: 'objective-markers', what: 'every quest objective resolves to a place a marker can point at', cmd: e2e('qa-objective-markers.mjs'), file: 'tools/e2e/qa-objective-markers.mjs', owner: 'Claude 7' },
  { id: 'integrity-save', what: 'saves: account-scoped slots, malformed slots never crash, old saves get defaults, New Game never overwrites a cloud hero', cmd: e2e('integrity-save.mjs'), file: 'tools/e2e/integrity-save.mjs', owner: 'Claude 6' },
  { id: 'integrity-fuzz', what: 'save fuzzing: 3000 corrupted real saves through load, migrate, defaults and sanitise never throw or seat an invalid hero', cmd: e2e('integrity-fuzz.mjs'), file: 'tools/e2e/integrity-fuzz.mjs', owner: 'Claude 6' },
  { id: 'boss-marks', what: 'every class’s lair-boss kill objective is marked at its lair door', cmd: e2e('qa-boss-marks.mjs'), file: 'tools/e2e/qa-boss-marks.mjs', owner: 'Claude 7' },
  { id: 'interact-once', what: 'counted searches count distinct objects (pressing F twice on one object counts once)', cmd: e2e('qa-interact-once.mjs'), file: 'tools/e2e/qa-interact-once.mjs', owner: 'Claude 7' },
  { id: 'reachable', what: 'every class’s Act I objectives are reachable on foot from its start waystone', cmd: e2e('qa-reachable.mjs'), file: 'tools/e2e/qa-reachable.mjs', owner: 'Claude 7' },
  { id: 'builds-text', what: 'every perk, spell, keystone, rune, affix, unique and hybrid has clean player-facing text, and it reaches the tooltips', cmd: e2e('qa-builds-text.mjs'), file: 'tools/e2e/qa-builds-text.mjs', owner: 'Claude 7' },
  { id: 'dialogue-graph', what: 'every conversation: nodes reachable, cycles exit, no soft-locks, every condition satisfiable, every effect target real', cmd: e2e('qa-dialogue-graph.mjs'), file: 'tools/e2e/qa-dialogue-graph.mjs', owner: 'Claude 7' },
  { id: 'key-hints', what: 'no player-facing text hard-codes a rebindable key; every {key:} token names a real action', cmd: e2e('qa-key-hints.mjs'), file: 'tools/e2e/qa-key-hints.mjs', owner: 'Claude 7' },
  { id: 'realm-server', what: 'public realm server: join (incl. slow sign-in), snapshots, chat, systems', cmd: e2e('realm-server.mjs') },
  { id: 'realm-fuzz', what: 'realm server under 30,000 malformed and flooding messages: stays up, honest player keeps streaming, memory bounded', cmd: e2e('integrity-realm-fuzz.mjs'), file: 'tools/e2e/integrity-realm-fuzz.mjs', owner: 'Claude 6' },
  { id: 'host-fuzz', what: 'co-op host under 6,000 hostile guest messages: no throw, the host hero, save and the honest guest untouched', cmd: e2e('integrity-host-fuzz.mjs'), file: 'tools/e2e/integrity-host-fuzz.mjs', owner: 'Claude 6' },
  { id: 'new-player', what: 'fresh player, real input: create → play → autosave', cmd: e2e('new-player.mjs', '--base', BASE), needs: ['web'] },
  { id: 'save-roundtrip', what: 'save → reload → load restores the hero', cmd: e2e('save-roundtrip.mjs', BASE), needs: ['web'] },
  { id: 'hud', what: 'HUD: frame, bars move in combat, buttons, rebinding, layout, boss bar, toasts, Pause, Death', cmd: e2e('hud.mjs', '--base', BASE), needs: ['web'] },
  { id: 'hc-panels', what: 'Pack / Skills / Spells / shop / Runeforge panels with real clicks', cmd: e2e('hc-panels.mjs', '--base', BASE), needs: ['web'] },
  { id: 'hc-builds-ui', what: 'browser: Runeforge tabs, perk tree (kinds, keystones, free reset), rune slots, rarity and tooltips with real clicks', cmd: e2e('hc-builds-ui.mjs', '--base', BASE), needs: ['web'], file: 'tools/e2e/hc-builds-ui.mjs', owner: 'Claude 3' },
  { id: 'hc-smoke', what: 'real combat in the browser for 3 classes', cmd: e2e('hc-smoke.mjs', '--class', 'warden,arcanist,jester', '--base', BASE), needs: ['web'] },
  { id: 'hc-features', what: 'browser: click hitboxes on sprites, telegraph damage, casts 1–4, spend a skill point, equip gear', cmd: e2e('hc-features.mjs', '--base', BASE), needs: ['web'], file: 'tools/e2e/hc-features.mjs', owner: 'Claude 3' },
  { id: 'narrative-features', what: 'browser: dialogue, trust, journal + tracker, codex, votes, object scenes, First Steps', cmd: [NODE, 'tools/narrative/features.mjs', '--base', BASE], needs: ['web'], file: 'tools/narrative/features.mjs', owner: 'Claude 5' },
  { id: 'escort-side', what: 'browser: escorts walk side-on (east/west/diagonal), every NPC baked', cmd: e2e('escort-side.mjs', '--base', BASE), needs: ['web'], file: 'tools/e2e/escort-side.mjs', owner: 'Claude 5' },
  { id: 'integrity-ui', what: 'browser: texture rebuilds keep live sprites, lifecycle resets, no async writes to closed screens', cmd: e2e('integrity-ui.mjs', '--base', BASE), needs: ['web'], file: 'tools/e2e/integrity-ui.mjs', owner: 'Claude 6' },
  { id: 'qa-input', what: 'browser: keys after alt-tab, rebinding every action, Esc only pauses, People per realm, window sizes, Large-text HUD', cmd: e2e('qa-input.mjs', '--base', BASE), needs: ['web'], file: 'tools/e2e/qa-input.mjs', owner: 'Claude 7' },
  { id: 'qa-markers', what: 'browser: quest markers on the minimap (edge arrow), map and Show on map, moving with the stage', cmd: e2e('qa-markers.mjs', '--base', BASE), needs: ['web'], file: 'tools/e2e/qa-markers.mjs', owner: 'Claude 7' },
  { id: 'qa-world-feel', what: 'browser: props fade when the hero walks behind them, searched objects say so, world feel basics', cmd: e2e('qa-world-feel.mjs', '--base', BASE), needs: ['web'], file: 'tools/e2e/qa-world-feel.mjs', owner: 'Claude 7' },
  { id: 'qa-rebake', what: 'browser: 72 class changes and 24 gear swaps rebuild sprites with no texture errors', cmd: e2e('qa-rebake.mjs', '--base', BASE), needs: ['web'], file: 'tools/e2e/qa-rebake.mjs', owner: 'Claude 7' },
  { id: 'soak', what: 'browser: 5 play sessions in a row (title, load, world, quit) leak no listeners, steppers, subscriptions or memory', cmd: e2e('integrity-soak.mjs', '--base', BASE, '--cycles', '5'), needs: ['web'], file: 'tools/e2e/integrity-soak.mjs', owner: 'Claude 6' },
  // before the suites that start the shared :8080 realm server: this one starts, kills and restarts its own there
  { id: 'resilience', what: 'browser: realm server dies mid-session, co-op host closes its tab, machine sleeps: clear message, progress saved, no stuck screen or duplicate seat', cmd: e2e('integrity-resilience.mjs', '--base', BASE), needs: ['web'], file: 'tools/e2e/integrity-resilience.mjs', owner: 'Claude 6' },
  { id: 'coop-world', what: 'two browsers in co-op: join, input, chat, party vote', cmd: e2e('coop-world.mjs', '--base', BASE), needs: ['web'] },
  { id: 'hc-front', what: 'front end: load, pause, public realm, chat, leave', cmd: e2e('hc-front.mjs', '--base', BASE), needs: ['web', 'realm'] },
  { id: 'realm-duel', what: 'live Duels realm: challenge, accept, duel starts', cmd: e2e('realm-duel.mjs', '--base', BASE), needs: ['web', 'realm'] },
  { id: 'ui-shots', what: 'every overlay renders (screenshots in tools/e2e/out)', cmd: e2e('ui-shots.mjs', '--base', BASE), needs: ['web'] },
];

const argv = process.argv.slice(2);
if (argv.includes('--list')) { for (const s of SUITES) console.log(`${s.id.padEnd(20)} ${s.what}`); process.exit(0); }
const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1].split(',') : null;
const suites = only ? SUITES.filter((s) => only.includes(s.id)) : SUITES;
mkdirSync(LOGS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function run(cmd, env = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd[0], cmd.slice(1), { cwd: ROOT, env: { ...process.env, HC_PREDEPLOY: '1', ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (out += d));
    p.on('close', (code) => resolve({ code, out }));
    p.on('error', (e) => resolve({ code: -1, out: `${out}\n${e.message}` }));
  });
}

// ── servers we start (and always stop: we kill only these PIDs) ──
const servers = [];
const stopServers = () => { for (const s of servers.splice(0)) try { s.kill(); } catch { /* gone */ } };
process.on('exit', stopServers);
process.on('SIGINT', () => { stopServers(); process.exit(130); });
const up = async (url) => { try { return (await fetch(url)).ok; } catch { return false; } };
async function startServer(kind) {
  if (kind === 'web') {
    if (await up(BASE)) throw new Error(`${BASE} is already in use: stop that server first`);
    const s = spawn(NODE, ['node_modules/vite/bin/vite.js', '--config', 'tools/e2e/vite.test.config.mjs', '--port', '5190', '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
    servers.push(s);
    for (let i = 0; i < 120 && !(await up(BASE)); i++) await sleep(500);
    if (!(await up(BASE))) throw new Error('test server did not start');
  } else {
    // :8080 is fixed (the DEV client's default). Another agent's realm server would be stale code: wait for it.
    for (let i = 0; i < 120 && (await up(`${REALM}/health`)); i++) { if (i === 0) console.log('  (waiting for :8080, another realm server is running)'); await sleep(5000); }
    if (await up(`${REALM}/health`)) throw new Error(':8080 stayed busy for 10 min');
    const b = await run([NODE, 'server/build.mjs']);
    if (b.code !== 0) throw new Error(`server build failed\n${b.out}`);
    const s = spawn(NODE, ['dist-server/main.mjs'], { cwd: ROOT, env: { ...process.env, PORT: '8080', DEV_AUTH: '1' }, stdio: 'ignore' });
    servers.push(s);
    for (let i = 0; i < 720 && !(await up(`${REALM}/health`)); i++) await sleep(250);
    if (!(await up(`${REALM}/health`))) throw new Error('realm server did not start');
  }
}

// other agents' browser runs wait while the deploy check runs (they queue again afterwards)
const releaseReserve = only ? () => undefined : reserveChrome('predeploy');
process.on('exit', () => releaseReserve());
const before = sourceHash();
console.log(`The Hollow Crown pre-deploy check: ${suites.length} suites, source ${before.hash.slice(0, 12)} (${before.files} files)\n`);
const results = [];
const started = new Set();
const t00 = Date.now();
for (const s of suites) {
  const t0 = Date.now();
  let ok = false, note = '', out = '';
  try {
    if (s.file && !existsSync(join(ROOT, s.file))) {
      note = `not written yet (${s.owner}: ${s.file})`;
    } else {
      for (const need of s.needs ?? []) if (!started.has(need)) { await startServer(need); started.add(need); }
      const r = await run(s.cmd);
      out = r.out;
      ok = r.code === 0 && !/^FAIL\b/m.test(out) && (s.judge ? s.judge(out) : true);
      if (!ok) note = r.code !== 0 ? `exit ${r.code}` : 'a check failed';
      const tally = out.match(/(\d+)\/(\d+) (passed|PASS)/g)?.at(-1);
      if (ok && tally) note = tally;
    }
  } catch (e) { note = e.message.split('\n')[0]; out += `\n${e.message}`; }
  const secs = Math.round((Date.now() - t0) / 1000);
  writeFileSync(join(LOGS, `${s.id}.log`), out);
  results.push({ id: s.id, ok, secs, note });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${s.id.padEnd(19)} ${String(secs).padStart(4)} s  ${s.what}${note ? `  [${note}]` : ''}`);
  if (!ok && out) console.log(out.trim().split('\n').filter((l) => /FAIL|Error|error|✗/.test(l)).slice(0, 6).map((l) => `        ${l.slice(0, 180)}`).join('\n'));
}
stopServers();
releaseReserve();

const after = sourceHash();
const failed = results.filter((r) => !r.ok).map((r) => r.id);
const changed = after.hash !== before.hash;
const ok = !failed.length && !changed && !only;
console.log(`\n${results.length - failed.length}/${results.length} suites passed in ${Math.round((Date.now() - t00) / 60000)} min. Logs: tools/e2e/out/predeploy/`);
if (changed) console.log('The source changed during the run (another agent edited files): the result cannot vouch for the current code. Run again.');
if (only) console.log('--only run: no deploy stamp written.');
else writeFileSync(STAMP, JSON.stringify({ ok, at: new Date().toISOString(), hash: before.hash, changedDuringRun: changed,
  passed: results.filter((r) => r.ok).map((r) => r.id), failed, results }, null, 2));
console.log(ok ? 'READY TO DEPLOY: the hosting guard will accept this exact code.' : 'NOT READY: the hosting guard will refuse a deploy.');
process.exit(ok ? 0 : 1);
