#!/usr/bin/env node
/**
 * Network resilience in the real game (headless Chrome, own realm server). Owner: Claude 6.
 *
 *   node server/build.mjs ; npx vite --config tools/e2e/vite.test.config.mjs ; node tools/e2e/integrity-resilience.mjs [--base …]
 *
 * S1 the realm server dies mid-session: the player lands on the title with a clear notice, progress saved, nothing
 *    stuck; when the server is back, entering the realm works again.
 * S2 the co-op host's tab closes: the guest lands on the title with a notice, its own save written.
 * S3 the machine sleeps (page frozen 20 s, then resumed): the solo game carries on, no errors.
 * Needs :8080 free (the DEV client's realm server). Offline cloud saves are covered in Node (integrity-save.mjs).
 */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { acquireChrome, CHROME_PATH } from './chrome-lock.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5199');
const PORT = 9700 + Math.floor(Math.random() * 90);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${String(detail).slice(0, 260)})` : ''}`); if (!ok) fails++; };

let realm = null;
const startRealm = async () => {
  realm = spawn(process.execPath, ['dist-server/main.mjs'], { env: { ...process.env, PORT: '8080', DEV_AUTH: '1' }, stdio: 'ignore' });
  for (let i = 0; i < 720; i++) { await sleep(250); try { if ((await fetch('http://localhost:8080/health')).ok) return true; } catch {} }
  return false;
};
const stopRealm = async () => { realm?.kill('SIGKILL'); realm = null; await sleep(500); };

await acquireChrome('integrity-resilience');
const chrome = spawn(CHROME_PATH, ['--headless=new', '--mute-audio', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${mkdtempSync(join(process.env.SCRATCH ?? tmpdir(), 'cdp-'))}`, '--window-size=1280,720',
  '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows',
  '--disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
setTimeout(() => { console.log('TIMEOUT'); chrome.kill('SIGKILL'); realm?.kill('SIGKILL'); process.exit(2); }, 10 * 60_000).unref();

async function tab(url) {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map(); const errors = [];
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result ?? d); pending.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails?.exception?.description?.split('\n')[0]); };
  const send = (method, params = {}) => { const i = ++id; ws.send(JSON.stringify({ id: i, method, params })); return new Promise((r) => pending.set(i, r)); };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: `(async () => (${expr}))()`, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 300)); return r.result?.value; };
  const waitFor = async (expr, ms = 60_000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await ev(expr)) return true; } catch { /* loading */ } await sleep(400); } return false; };
  return { id: t.id, send, ev, waitFor, errors };
}
const hero = (name, cls, space = 'concordia') => `(async () => {
  const core = await import('/src/core/index.ts');
  const { defaultLook } = await import('/src/data/classes/hc/index.ts');
  const st = core.createNewGameState(0);
  st.player.name = ${JSON.stringify(name)};
  st.player.hero = { classId: ${JSON.stringify(cls)}, look: defaultLook(${JSON.stringify(cls)}, 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
  st.world.location.space = ${JSON.stringify(space)};
  core.Game.set(st);
  const { SaveService } = await import('/src/firebase/SaveService.ts');
  await SaveService.save(st, { localOnly: true });
  return true;
})()`;
const savedAt = `(() => { try { return JSON.parse(localStorage.getItem('hollowcrown.save.0')).meta.updatedAt; } catch { return 0; } })()`;
const onTitle = `window.__game.scene.isActive('MainMenu') && !window.__game.scene.isActive('WorldV2') && !window.__game.scene.isActive('HudV2')`;
const notice = `(window.__game.scene.getScene('MainMenu').children.list.find((o) => typeof o.text === 'string' && /Disconnected from|ended the session/.test(o.text))?.text ?? '')`;
const enterRealm = `(async () => {
  const coop = await import('/src/net/coop/index.ts');
  const list = await coop.browseRealms();
  const r = list.find((x) => x.id === 'brindlecross-peaceful');
  await coop.enterRealm(r);
  const g = window.__game; g.scene.stop('MainMenu');
  g.scene.start('WorldV2', { realm: { id: r.id, space: r.space, rule: r.rule, name: r.name } });
  return true;
})()`;

try {
  for (let i = 0; i < 40; i++) { await sleep(250); try { await fetch(`http://127.0.0.1:${PORT}/json/version`); break; } catch {} }
  // ───── S1: realm server dies mid-session, then comes back ─────
  check('realm server up', await startRealm());
  const A = await tab(`${BASE}/`);
  await A.waitFor(`!!window.__game?.scene.isActive('MainMenu')`);
  await A.ev(hero('Rhea', 'warden'));
  await A.ev(enterRealm);
  check('S1: in the public realm', await A.waitFor(`!!window.__game.scene.isActive('HudV2')`));
  await sleep(2500);
  const before = await A.ev(savedAt);
  await stopRealm();
  const back = await A.waitFor(onTitle, 15_000);
  const n1 = back ? await A.ev(notice) : '';
  check('S1: realm dies → the title, with a clear notice, nothing stuck', back && /disconnected from the realm/i.test(n1), JSON.stringify({ back, notice: n1 }));
  check('S1: progress saved on the way out', (await A.ev(savedAt)) > before, `${before} → ${await A.ev(savedAt)}`);
  await startRealm();
  let again = false;
  try { await A.ev(enterRealm); again = await A.waitFor(`!!window.__game.scene.isActive('HudV2')`); } catch (e) { again = String(e); }
  check('S1: when the realm is back, entering it works again', again === true, String(again));
  const realmCount = (await (await fetch('http://localhost:8080/realms')).json()).find((r) => r.id === 'brindlecross-peaceful')?.players;
  check('S1: no duplicate seat after coming back', realmCount === 1, `players ${realmCount}`);
  await A.ev(`(async () => { (await import('/src/net/coop/index.ts')).leaveCoop(); return 1; })()`);
  await stopRealm();

  // ───── S2: the co-op host's tab closes ─────
  const H = await tab(`${BASE}/`);
  await H.waitFor(`!!window.__game?.scene.isActive('MainMenu')`);
  await H.ev(hero('Hosty', 'warden'));
  await H.ev(`(window.__game.scene.getScene('MainMenu').scene.start('WorldV2'), 1)`);
  await H.waitFor(`!!window.__game.scene.isActive('HudV2')`);
  await sleep(2000);
  const code = await H.ev(`(async () => (await import('/src/net/coop/index.ts')).hostGame(() => true))()`);
  const G = await tab(`${BASE}/`);
  await G.waitFor(`!!window.__game?.scene.isActive('MainMenu')`);
  await G.ev(hero('Gus', 'arcanist'));
  const joined = await G.ev(`(async () => { const coop = await import('/src/net/coop/index.ts'); const g = await coop.joinGame(${JSON.stringify(code)}); window.__game.scene.getScene('MainMenu').scene.start('WorldV2', { guest: true }); return g.role; })()`);
  check('S2: guest joined the host', joined === 'guest' && await G.waitFor(`!!window.__game.scene.isActive('HudV2')`), String(joined));
  await sleep(2500);
  const gBefore = await G.ev(savedAt);
  await fetch(`http://127.0.0.1:${PORT}/json/close/${H.id}`); // the host closes the tab
  const gBack = await G.waitFor(onTitle, 40_000);
  const n2 = gBack ? await G.ev(notice) : '';
  check('S2: host gone → the guest is back at the title with a notice', gBack && /disconnected from the host|ended the session/i.test(n2), JSON.stringify({ gBack, notice: n2 }));
  check("S2: the guest's progress is saved", (await G.ev(savedAt)) > gBefore);

  // ───── S3: the machine sleeps (page frozen), then wakes ─────
  await G.ev(hero('Sleepy', 'ranger'));
  await G.ev(`(window.__game.scene.getScene('MainMenu').scene.start('WorldV2'), 1)`);
  await G.waitFor(`!!window.__game.scene.isActive('HudV2')`);
  await sleep(2000);
  const tick = `(async () => (await import('/src/net/index.ts')).sim.tick)()`;
  const state = `(async () => { const { sim } = await import('/src/net/index.ts'); const l = window.__game.loop; return { vis: document.visibilityState, focus: document.hasFocus(), paused: sim.isPaused(), running: l.running, fps: Math.round(l.actualFps) }; })()`;
  const p1 = await G.ev(tick); await sleep(1500); const p2 = await G.ev(tick);
  const pre = { ticks: p2 - p1, ...(await G.ev(state)) };
  const e0 = G.errors.length;
  await G.send('Page.setWebLifecycleState', { state: 'frozen' });
  await sleep(20_000);
  await G.send('Page.setWebLifecycleState', { state: 'active' });
  await sleep(1500);
  const t1 = await G.ev(tick); await sleep(1500); const t2 = await G.ev(tick);
  check('S3: after sleeping, the game carries on (sim ticking, world up, no errors)', t2 > t1 && await G.ev(`window.__game.scene.isActive('HudV2')`) && G.errors.length === e0, JSON.stringify({ before: pre, after: { ticks: t2 - t1, ...(await G.ev(state)) }, errors: G.errors.slice(e0, e0 + 2) }));
  const errs = [...A.errors, ...G.errors].filter((e) => !/auth\/|firestore|Firebase/i.test(e ?? ''));
  check('no page errors', !errs.length, errs.slice(0, 3).join(' || '));
} catch (e) { check('harness', false, String(e)); }
chrome.kill('SIGKILL'); await stopRealm();
console.log(fails ? `\nintegrity-resilience: ${fails} FAILED` : '\nintegrity-resilience: ALL PASS');
process.exit(fails ? 1 : 0);
