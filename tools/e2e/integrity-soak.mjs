#!/usr/bin/env node
/**
 * Long-session leak check (headless Chrome via cdp.mjs). Owner: Claude 6.
 *
 *   npx vite --config tools/e2e/vite.test.config.mjs ; node tools/e2e/integrity-soak.mjs [--base http://localhost:5199] [--cycles 10]
 *
 * Plays title → World → Pause › Quit to title N times through the real quit path and, after each cycle (GC first),
 * records the JS heap, bus handlers, net subscriptions, sim steppers, textures and anims. From cycle 2 on these must
 * stay flat (the first cycle warms caches): a listener or stepper added per World/HUD start and never released shows
 * up as steady growth here, long before a player notices duplicate toasts or a slower game.
 */
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5199');
const CYCLES = Number(arg('cycles', 10));
let fails = 0;
const check = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${String(detail).slice(0, 300)})` : ''}`); if (!ok) fails++; };

const page = await launch();
const errors = [];
page.on((m) => { if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception'); });
const ev = (expr) => page.eval(`(async () => (${expr}))()`);
const waitFor = async (expr, ms = 90_000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await ev(expr)) return true; } catch { /* loading */ } await sleep(400); } return false; };
await page.send('Performance.enable');

const counts = `(async () => {
  const core = await import('/src/core/index.ts');
  const { sim } = await import('/src/net/index.ts');
  const g = window.__game;
  let bus = 0; for (const s of core.bus.handlers.values()) bus += s.size;
  const net = core.Services.tryGet('net');
  return { bus, netSubs: net?.subs?.size ?? -1, steppers: sim.steppers.length, textures: Object.keys(g.textures.list).length, anims: g.anims.anims.size,
    scenes: g.scene.getScenes(true).map((s) => s.scene.key).join(',') };
})()`;
const heapMb = async () => {
  await page.send('HeapProfiler.collectGarbage');
  const m = await page.send('Performance.getMetrics');
  return Math.round((m.metrics?.find((x) => x.name === 'JSHeapUsedSize')?.value ?? 0) / 1e5) / 10;
};

try {
  await page.goto(`${BASE}/`);
  check('title up', await waitFor(`!!window.__game?.scene.isActive('MainMenu')`));
  const rows = [];
  for (let c = 1; c <= CYCLES; c++) {
    await ev(`(async () => {
      const core = await import('/src/core/index.ts');
      const { defaultLook } = await import('/src/data/classes/hc/index.ts');
      const st = core.createNewGameState(0);
      st.player.name = 'Soak';
      st.player.hero = { classId: 'warden', look: defaultLook('warden', 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
      st.world.location.space = 'realm:rime';
      core.Game.set(st);
      core.bus.emit('game:loaded', { slot: 0 });
      window.__game.scene.getScene('MainMenu').scene.start('WorldV2');
      return 1;
    })()`);
    if (!(await waitFor(`!!window.__game.scene.isActive('HudV2')`, 60_000))) { check(`cycle ${c}: world started`, false); break; }
    await sleep(2500);
    await ev(`(async () => { const g = window.__game; g.scene.getScene('HudV2').scene.launch('Pause'); await new Promise((r) => setTimeout(r, 400)); g.scene.getScene('Pause').quit(); return 1; })()`);
    if (!(await waitFor(`window.__game.scene.isActive('MainMenu') && !window.__game.scene.isActive('WorldV2')`, 30_000))) { check(`cycle ${c}: back at the title`, false); break; }
    await sleep(800);
    rows.push({ c, heap: await heapMb(), ...(await ev(counts)) });
    console.log(`cycle ${c}: ${JSON.stringify(rows.at(-1))}`);
  }
  if (rows.length === CYCLES && CYCLES >= 3) {
    const a = rows[1], z = rows.at(-1);
    const flat = (k) => z[k] === a[k];
    check('bus handlers stay flat across sessions', flat('bus'), `${a.bus} → ${z.bus}`);
    check('net subscriptions stay flat', flat('netSubs'), `${a.netSubs} → ${z.netSubs}`);
    check('sim steppers stay flat', flat('steppers'), `${a.steppers} → ${z.steppers}`);
    check('textures and anims stay bounded', z.textures - a.textures <= 2 && z.anims - a.anims <= 4, `textures ${a.textures} → ${z.textures}, anims ${a.anims} → ${z.anims}`);
    const perCycle = (z.heap - a.heap) / (z.c - a.c);
    check('heap growth under 1.5 MB per session after GC', perCycle < 1.5, `${a.heap} → ${z.heap} MB (${perCycle.toFixed(2)} MB/cycle)`);
    check('only the title runs after quitting', z.scenes === 'MainMenu', z.scenes);
  }
  check('no page errors', !errors.length, errors.slice(0, 3).join(' || '));
} catch (e) { check('harness', false, String(e)); }

await page.close();
console.log(fails ? `\nintegrity-soak: ${fails} FAILED` : '\nintegrity-soak: ALL PASS');
process.exit(fails ? 1 : 0);
