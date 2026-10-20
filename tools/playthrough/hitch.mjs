// Fresh-terrain hitch probe (Claude 2, RELEASE.md §3): moves across fresh terrain in a real browser and reports
// frame times (rAF deltas: p50/p95/p99/max, frames over 33/50 ms), long tasks, and the renderer's main-thread split
// (chunk shows: tiles/sprites/lights; first-use art bakes) from __world.chunkStats(). One Chrome via cdp.mjs's lock.
//   npx vite --config tools/e2e/vite.e2e.config.mjs     (no-HMR server on :5198; restart after edits)
//   node tools/playthrough/hitch.mjs [--space realm:ash] [--mode fly|walk] [--secs 20] [--dir D] [--tp tx,ty] [--base url]
import { launch, sleep } from '../e2e/cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const space = arg('space', 'realm:ash'), mode = arg('mode', 'fly'), secs = Number(arg('secs', '20')), dir = arg('dir', 'D');
const base = arg('base', 'http://localhost:5198'), tp = arg('tp', '');
const url = `${base}/?scene=WorldV2&space=${space}&hc_class=arcanist${mode === 'fly' ? '&fly=1' : ''}${tp ? `&tp=${tp}` : ''}`;

const page = await launch({ port: 9345 });
try {
  await page.goto(url);
  for (let i = 0; i < 120; i++) { await sleep(500); if (await page.eval('!!window.__world && window.__world.chunkStats().shown > 0')) break; }
  await sleep(4000); // settle: first view, prefetch ring
  console.log('start', JSON.stringify(await page.eval('window.__world.where()')), 'dialogue open:', await page.eval('!!document.querySelector("canvas") && !!window.narrative?.open?.()'));
  await page.eval(`(() => {
    window.__hitch = { frames: [], long: [], s0: JSON.parse(JSON.stringify(window.__world.chunkStats())) };
    let last = performance.now();
    const tick = (t) => { window.__hitch.frames.push(t - last); last = t; if (!window.__hitch.done) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__hitch.long.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: false }); } catch {}
    return true;
  })()`);
  const keys = [`Key${dir}`.replace('KeyRight', 'ArrowRight')];
  const profile = process.argv.includes('--profile');
  if (profile) { await page.send('Profiler.enable'); await page.send('Profiler.setSamplingInterval', { interval: 250 }); await page.send('Profiler.start'); }
  await page.hold(keys, secs * 1000);
  await sleep(500);
  if (profile) spans((await page.send('Profiler.stop')).profile);
  const r = await page.eval(`(() => {
    const h = window.__hitch; h.done = true;
    const raw = h.frames.slice(2), at = [], tAt = []; let acc = 0; raw.forEach((x, i) => { acc += x; if (x > 33) { at.push(i); tAt.push(Math.round(acc)); } });
    const f = [...raw].sort((a, b) => a - b), q = (p) => f[Math.min(f.length - 1, Math.floor(p * f.length))];
    const s = window.__world.chunkStats(), s0 = h.s0;
    return { where: window.__world.where(), frames: f.length, p50: q(0.5), p95: q(0.95), p99: q(0.99), max: f[f.length - 1],
      over33: f.filter((x) => x > 33).length, over50: f.filter((x) => x > 50).length, spikesAtMs: tAt, top: f.slice(-8).map((x) => Math.round(x)),
      long: h.long.sort((a, b) => b - a).slice(0, 10),
      shows: s.show.shows - s0.show.shows, showMax: s.show.max, tilesMs: s.show.tiles - s0.show.tiles, spritesMs: s.show.sprites - s0.show.sprites, lightsMs: s.show.lights - s0.show.lights,
      slowShows: s.show.slow.slice(s0.show.slow.length, s0.show.slow.length + 8),
      bakes: s.bakes.n - s0.bakes.n, bakeMs: s.bakes.ms - s0.bakes.ms, bakeMax: s.bakes.max, slowBakes: s.bakes.slow.slice(s0.bakes.slow.length, s0.bakes.slow.length + 8),
      worker: s.worker, delivered: s.delivered - s0.delivered, syncBuilds: s.syncBuilds - s0.syncBuilds };
  })()`);
  const n = (x) => (typeof x === 'number' ? Math.round(x * 10) / 10 : x);
  console.log(`${space} ${mode} ${secs}s → ${JSON.stringify(r.where)}`);
  console.log(`frames ${r.frames}: p50 ${n(r.p50)} p95 ${n(r.p95)} p99 ${n(r.p99)} max ${n(r.max)} ms; >33 ms ${r.over33}, >50 ms ${r.over50}; slowest ${r.top.join(' ')}`);
  console.log(`long tasks (ms): ${r.long.join(' ') || 'none'}; frames > 33 ms at ${r.spikesAtMs.join(', ') || '-'} ms into the run`);
  console.log(`chunks shown ${r.shows} (max ${n(r.showMax)} ms; tiles ${n(r.tilesMs)} sprites ${n(r.spritesMs)} lights ${n(r.lightsMs)} ms total), worker ${r.worker} delivered ${r.delivered}, sync builds ${r.syncBuilds}`);
  for (const x of r.slowShows) console.log(`  slow show ${x}`);
  console.log(`art bakes ${r.bakes} (${n(r.bakeMs)} ms, max ${n(r.bakeMax)})`);
  for (const x of r.slowBakes) console.log(`  slow bake ${x}`);
} finally {
  await page.close();
}

/** Busy stretches over 40 ms in a CPU profile, each with where its time went (innermost game frame, and leaves). */
function spans(p) {
  const nodes = new Map(p.nodes.map((n) => [n.id, n]));
  const parent = new Map();
  for (const n of p.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
  const idle = (id) => ['(idle)', '(program)', '(garbage collector)'].includes(nodes.get(id).callFrame.functionName) && nodes.get(id).callFrame.functionName !== '(garbage collector)';
  const where = (id, game) => {
    for (let x = id; x !== undefined; x = parent.get(x)) {
      const f = nodes.get(x).callFrame;
      if (!game || /\/src\//.test(f.url)) return `${f.functionName || '(anon)'} ${f.url.replace(/^.*\/src\//, 'src/').replace(/\?.*$/, '')}:${f.lineNumber + 1}`;
    }
    return '(no game frame)';
  };
  let t = 0, start = -1, acc = null;
  const out = [];
  const flush = (end) => { if (acc && end - start > 40) out.push({ ms: end - start, acc }); acc = null; start = -1; };
  p.samples.forEach((id, i) => {
    t += (p.timeDeltas[i] ?? 0) / 1000;
    if (idle(id)) { flush(t); return; }
    if (start < 0) { start = t; acc = { game: new Map(), leaf: new Map() }; }
    const d = (p.timeDeltas[i + 1] ?? 0) / 1000;
    const g = where(id, true), l = where(id, false);
    acc.game.set(g, (acc.game.get(g) ?? 0) + d);
    acc.leaf.set(l, (acc.leaf.get(l) ?? 0) + d);
  });
  flush(t);
  console.log(`busy stretches > 40 ms: ${out.length}`);
  for (const s of out.sort((a, b) => b.ms - a.ms).slice(0, 4)) {
    const top = (m) => [...m].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${v.toFixed(1)} ${k}`).join('\n      ');
    console.log(`  ${s.ms.toFixed(0)} ms\n    game:\n      ${top(s.acc.game)}\n    leaf:\n      ${top(s.acc.leaf)}`);
  }
}
