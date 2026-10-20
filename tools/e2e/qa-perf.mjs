// QA performance (Claude 7): what a player feels, measured on a production build (no DEV globals) or the dev server.
// Real input only: title → New Game → name → Enter → world, then walk a small loop for --minutes.
// Records: load to title (boot screen gone), load to world (first save written), rAF frame times per minute
// (p50/p95/p99, frames > 50 ms), long tasks (PerformanceObserver), JS heap after a forced GC each minute, DOM nodes,
// and the gzipped size of the built JS (--dist). Writes JSON to --out.
//   npx vite build --outDir <dir> && npx vite preview --outDir <dir> --port 5171 --strictPort
//   node tools/e2e/qa-perf.mjs --base http://localhost:5171 --minutes 10 [--dist <dir>] [--throttle 4] [--out tools/e2e/out/qa]
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5171'), OUT = arg('out', 'tools/e2e/out/qa'), DIST = arg('dist', '');
const MINUTES = Number(arg('minutes', '10')), THROTTLE = Number(arg('throttle', '1'));
// budgets (desktop, 1280×720). A slow-machine run (--throttle) reports only.
const BUDGET = { titleMs: 8000, /* worldMs: Begin → last long frame */ worldMs: 20000, p95Ms: 25, longPerMin: 30, heapGrowthMBPerMin: 3, gzipMB: 4 };
mkdirSync(OUT, { recursive: true });
let fails = 0, total = 0;
const report = THROTTLE > 1;
const check = (what, ok, detail = '') => { total++; if (!ok && !report) fails++; console.log(`${ok ? 'PASS' : report ? 'note' : 'FAIL'} ${what}${detail ? ` :: ${detail}` : ''}`); };
const result = { base: BASE, minutes: MINUTES, throttle: THROTTLE, at: new Date().toISOString(), perMinute: [] };

if (DIST) {
  const files = [];
  const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(js|css)$/.test(f)) files.push(p); } };
  walk(DIST);
  const sizes = files.map((p) => { const b = readFileSync(p); return { f: p.slice(DIST.length + 1), raw: b.length, gz: gzipSync(b).length }; }).sort((a, b) => b.gz - a.gz);
  const gz = sizes.reduce((n, s) => n + s.gz, 0), raw = sizes.reduce((n, s) => n + s.raw, 0);
  result.bundle = { rawMB: +(raw / 1048576).toFixed(2), gzipMB: +(gz / 1048576).toFixed(2), top: sizes.slice(0, 6).map((s) => `${s.f} ${(s.gz / 1048576).toFixed(2)} MB gz`) };
  check(`built JS+CSS gzipped under ${BUDGET.gzipMB} MB`, gz / 1048576 < BUDGET.gzipMB, `${result.bundle.gzipMB} MB gz (${result.bundle.rawMB} MB raw); ${result.bundle.top.join(', ')}`);
}

const page = await launch({ port: 9500 + Math.floor(Math.random() * 100) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
// recorder runs before the game's own scripts
await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `
  window.__perf = { t0: performance.now(), frames: [], long: [], boot: null };
  (function loop(prev) { requestAnimationFrame((t) => { if (prev) window.__perf.frames.push(t - prev); loop(t); }); })(0);
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.long.push(e.duration); }).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  // the boot screen (#boot) is removed when Phaser has booted: the title is up. Observe the document itself: this runs
  // before <html> exists
  new MutationObserver(function () { if (document.body && !document.getElementById('boot') && window.__perf.boot === null) window.__perf.boot = performance.now(); })
    .observe(document, { childList: true, subtree: true });
` });
await page.send('Performance.enable');
if (THROTTLE > 1) await page.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
const waitFor = async (expr, ms) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (await page.eval(expr)) return Date.now() - t; } catch { /* navigating */ } await sleep(250); } return null; };
const metric = async (name) => (await page.send('Performance.getMetrics')).metrics.find((m) => m.name === name)?.value ?? 0;
const pct = (a, p) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(1); };

try {
  await page.goto(`${BASE}/`);
  await waitFor('window.__perf && window.__perf.boot !== null', 120000);
  result.titleMs = Math.round(await page.eval('window.__perf.boot'));
  check(`title shows within ${BUDGET.titleMs / 1000} s`, result.titleMs < BUDGET.titleMs, `${result.titleMs} ms`);
  await sleep(2500);
  await page.click(250, 404); // New Game (Continue is disabled on a fresh profile)
  await sleep(3000);
  for (let i = 0; i < 14; i++) await page.press('Backspace', 30);
  for (const ch of 'Perf') await page.press(`Key${ch.toUpperCase()}`, 30);
  await page.press('Enter', 60);
  const t1 = Date.now();
  // the world is ready when the save exists AND frames have run smoothly (none over 50 ms) for 2 s: loading the
  // realm (chunks, bakes, scenes) shows as a run of long frames; production has no DEV handle to ask
  await page.eval('(window.__perf.frames.length = 0, 1)');
  let lastSpike = t1, saved = false;
  while (Date.now() - t1 < 120000) {
    await sleep(250);
    const f = await page.eval('window.__perf.frames.splice(0)').catch(() => []);
    if (f.some((d) => d > 50)) lastSpike = Date.now();
    saved ||= await page.eval(`!!localStorage.getItem('hollowcrown.save.0')`).catch(() => false);
    if (saved && Date.now() - lastSpike >= 2000 && Date.now() - t1 > 1000) break;
  }
  result.worldMs = saved ? lastSpike - t1 : null;
  check(`world loaded and smooth within ${BUDGET.worldMs / 1000} s of Begin`, saved && result.worldMs < BUDGET.worldMs, `${result.worldMs} ms (last frame > 50 ms)`);
  await sleep(4000);
  // the opening narration: Space through it, 1 on choices (no DEV handle in production)
  for (let i = 0; i < 25; i++) { await page.press(i % 5 === 4 ? 'Digit1' : 'Space', 60); await sleep(350); }
  await page.screenshot(`${OUT}/perf-start.png`);

  const route = [['KeyD'], ['KeyS'], ['KeyA'], ['KeyW']];
  for (let m = 0; m < MINUTES; m++) {
    await page.eval('(window.__perf.frames.length = 0, window.__perf.long.length = 0, 1)');
    // headless Chrome paces rAF itself (~50 Hz), so frame times hide headroom: main-thread busy time shows the real cost
    const busy0 = (await metric('TaskDuration')), wall0 = Date.now();
    const tEnd = Date.now() + 60_000;
    let leg = 0;
    while (Date.now() < tEnd) {
      // half the minute walking a small square, half standing (idle cost + leak check without input)
      if (Math.floor((tEnd - Date.now()) / 15000) % 2 === 0) { await page.hold(route[leg++ % 4], 2500); } else await sleep(2500);
      // Esc out of anything the walk opened (a dialogue, Death screen stays: it is part of a normal session)
      if (leg % 8 === 0) await page.press('Escape');
    }
    const s = await page.eval('({ frames: window.__perf.frames.slice(), long: window.__perf.long.slice() })');
    const busyPct = Math.round((((await metric('TaskDuration')) - busy0) * 1000 / (Date.now() - wall0)) * 100);
    await page.send('HeapProfiler.collectGarbage');
    await sleep(300);
    const heapMB = +((await metric('JSHeapUsedSize')) / 1048576).toFixed(1);
    const row = {
      minute: m + 1, busyPct, fps: +(s.frames.length / 60).toFixed(1), p50: pct(s.frames, 0.5), p95: pct(s.frames, 0.95), p99: pct(s.frames, 0.99),
      over50: s.frames.filter((f) => f > 50).length, long: s.long.length, longMs: Math.round(s.long.reduce((a, b) => a + b, 0)),
      heapMB, nodes: await metric('Nodes'), listeners: await metric('JSEventListeners'),
    };
    result.perMinute.push(row);
    console.log(`minute ${row.minute}: main thread busy ${row.busyPct}%, ${row.fps} fps, frame p50/p95/p99 ${row.p50}/${row.p95}/${row.p99} ms, >50 ms ×${row.over50}, long tasks ${row.long} (${row.longMs} ms), heap ${heapMB} MB, nodes ${row.nodes}, listeners ${row.listeners}`);
  }
  await page.screenshot(`${OUT}/perf-end.png`);
  const rows = result.perMinute;
  const worstP95 = Math.max(...rows.map((r) => r.p95));
  check(`frame time p95 under ${BUDGET.p95Ms} ms every minute`, worstP95 < BUDGET.p95Ms, rows.map((r) => r.p95).join(' / '));
  const worstBusy = Math.max(...rows.map((r) => r.busyPct));
  check('main thread busy under 60% every minute (headroom for slower PCs)', worstBusy < 60, rows.map((r) => r.busyPct + '%').join(' / '));
  const worstLong = Math.max(...rows.map((r) => r.long));
  check(`long tasks under ${BUDGET.longPerMin} a minute`, worstLong < BUDGET.longPerMin, rows.map((r) => r.long).join(' / '));
  if (rows.length >= 3) {
    // slope of heap after GC from minute 2 on (minute 1 still loads the area)
    const pts = rows.slice(1).map((r, i) => [i, r.heapMB]);
    const n = pts.length, mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
    const slope = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / (pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0) || 1);
    result.heapSlopeMBPerMin = +slope.toFixed(2);
    check(`heap after GC grows under ${BUDGET.heapGrowthMBPerMin} MB/min`, slope < BUDGET.heapGrowthMBPerMin, `${slope.toFixed(2)} MB/min (${rows.map((r) => r.heapMB).join(' → ')})`);
    const nodesUp = rows[rows.length - 1].listeners - rows[1].listeners;
    check('event listeners do not keep growing', nodesUp < 200, `${rows[1].listeners} → ${rows[rows.length - 1].listeners}`);
  }
} catch (e) { check('harness', false, String(e)); }
const errs = errors.filter((e) => !/auth\/|firestore|Firebase/i.test(e));
check('no console errors', !errs.length, errs.slice(0, 4).join(' | '));
result.errors = errs.slice(0, 20);
const file = join(OUT, `perf-${THROTTLE > 1 ? `cpu${THROTTLE}x-` : ''}${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
writeFileSync(file, JSON.stringify(result, null, 2));
console.log(`wrote ${file}`);
await page.close();
console.log(`\n${total - fails}/${total} passed`);
process.exit(fails ? 1 : 0);
