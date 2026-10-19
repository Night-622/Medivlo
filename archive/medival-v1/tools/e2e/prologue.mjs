#!/usr/bin/env node
// Phase 1 exit test: CharacterCreate → prologue.complete with REAL combat, for each class.
//   node tools/e2e/prologue.mjs [--base http://localhost:5198] [--class warden,ranger,arcanist] [--minutes 30] [--out tools/e2e/out]
// Needs a no-HMR dev server (see tools/e2e/README.md). Travel between objectives uses Claude 2's DEV __world
// teleports; dialogue, interaction and every fight use real keyboard/mouse input through CDP.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, sleep } from './cdp.mjs';
import { Bot } from './bot.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5198');
const CLASSES = arg('class', 'warden,ranger,arcanist').split(',');
const MINUTES = Number(arg('minutes', '30'));
const OUT = arg('out', join(HERE, 'out'));
const PORT = Number(arg('port', '9340'));
mkdirSync(OUT, { recursive: true });
const HELPERS = readFileSync(join(HERE, 'page-helpers.js'), 'utf8');

const log = (cls, ...a) => console.log(`[${new Date().toISOString().slice(11, 19)}] [${cls}]`, ...a);

async function runClass(cls) {
  const b = await launch({ port: PORT });
  const consoleErrors = [];
  b.on((m) => {
    if (m.method === 'Runtime.exceptionThrown') consoleErrors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') consoleErrors.push(m.params.args.map((x) => x.value ?? x.description).join(' ').slice(0, 300));
  });
  const t0 = Date.now();
  const report = { cls, ok: false, steps: [], deaths: 0, kills: 0, bugs: [], minutes: 0, t0Ms: t0 };
  const shot = (name) => b.screenshot(join(OUT, `${cls}-${name}.png`));
  try {
    await b.goto(`${BASE}/`);
    for (let i = 0; i < 120; i++) { await sleep(500); if (await b.eval('!!window.__game && window.__game.scene.getScenes(true).some(s => s.sys.settings.key === "MainMenu")').catch(() => false)) break; }
    await b.eval(HELPERS);
    await b.eval('new Promise(r => { const t = setInterval(() => { if (window.__e2e?.ready) { clearInterval(t); r(true); } }, 50); })');
    const clickLabel = async (scene, label, exact = true) => {
      let p = null;
      for (let i = 0; i < 30 && !p; i++) { p = await b.eval(`window.__e2e.findClickable(${JSON.stringify(scene)}, ${JSON.stringify(label)}, ${exact})`); if (!p) await sleep(200); }
      if (!p) throw new Error(`no clickable "${label}" in ${scene}`);
      await b.click(p.x, p.y);
      await sleep(350);
    };
    // ── main menu → character creation (real clicks) ──
    await clickLabel('MainMenu', 'New Campaign');
    const clsName = cls[0].toUpperCase() + cls.slice(1);
    await clickLabel('CharacterCreate', clsName);
    await clickLabel('CharacterCreate', 'Traits');
    await clickLabel('CharacterCreate', 'Ironhide');
    await clickLabel('CharacterCreate', 'Quickfoot');
    await clickLabel('CharacterCreate', 'Ancestry');
    await clickLabel('CharacterCreate', 'Haldish');
    await clickLabel('CharacterCreate', 'Name');
    for (const ch of `Tester ${clsName}`) await b.press(ch === ' ' ? 'Space' : `Key${ch.toUpperCase()}`, 30);
    await shot('create');
    await clickLabel('CharacterCreate', 'Begin the Tale');
    for (let i = 0; i < 60; i++) { await sleep(500); if ((await b.eval('window.__e2e.snap().scene')) === 'World' && await b.eval('!!window.__combat')) break; }
    report.steps.push(`created ${cls}: ${JSON.stringify(await b.eval('window.__e2e.snap().player'))}`);
    log(cls, 'in world');
    await shot('world-start');

    // ── play ──
    const bot = new Bot(b, cls, report, (m) => log(cls, m));
    report.ok = await bot.play(MINUTES * 60_000);
    await shot(report.ok ? 'complete' : 'stuck');
  } catch (e) {
    report.bugs.push(`harness: ${e.message}`);
    log(cls, 'ERROR', e.message);
    try { await shot('error'); } catch { /* */ }
  } finally {
    report.minutes = Math.round((Date.now() - t0) / 600) / 100;
    report.consoleErrors = [...new Set(consoleErrors)].slice(0, 30);
    try { report.final = await b.eval('window.__e2e.snap()'); delete report.final?.flags; } catch { /* */ }
    try { report.flags = await b.eval('Object.fromEntries(Object.entries(window.__e2e.snap().flags ?? {}).filter(([k]) => k.startsWith("prologue")))'); } catch { /* */ }
    await b.close();
  }
  return report;
}

const results = [];
for (const cls of CLASSES) {
  console.log(`\n===== ${cls} =====`);
  const r = await runClass(cls);
  results.push(r);
  writeFileSync(join(OUT, `${cls}-report.json`), JSON.stringify(r, null, 2));
  console.log(`${r.ok ? 'PASS' : 'FAIL'} ${cls} in ${r.minutes} min · deaths ${r.deaths} · bugs ${r.bugs.length} · console errors ${r.consoleErrors?.length ?? 0}`);
}
writeFileSync(join(OUT, 'summary.json'), JSON.stringify(results.map(({ cls, ok, minutes, deaths, bugs, consoleErrors, flags }) => ({ cls, ok, minutes, deaths, bugs, consoleErrors, flags })), null, 2));
process.exit(results.every((r) => r.ok) ? 0 : 1);
