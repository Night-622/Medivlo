// Duels in a live public realm (Claude 1): two tabs enter the Duels realm on the realm server; A types /duel Bo,
// B clicks Accept on the prompt; both see duel:started. Needs the test Vite server + DEV_AUTH realm server (:8080).
//   node tools/e2e/realm-duel.mjs [--out dir]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { acquireChrome, CHROME_PATH } from './chrome-lock.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5199');
const OUT = arg('out', 'tools/e2e/out');
mkdirSync(OUT, { recursive: true });
const PORT = 9800 + Math.floor(Math.random() * 100);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await acquireChrome('realm-duel');
const chrome = spawn(CHROME_PATH, ['--headless=new', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${mkdtempSync(join(process.env.SCRATCH ?? tmpdir(), 'cdp-'))}`, '--window-size=1280,720',
  // both tabs must keep their game loops running
  '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows',
  '--disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
setTimeout(() => { console.log('TIMEOUT'); chrome.kill('SIGKILL'); process.exit(2); }, 8 * 60_000).unref();

async function tab(url) {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map(); const errors = [];
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result ?? d); pending.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails?.exception?.description?.split('\n').slice(0, 3).join(' | ')); };
  const send = (method, params = {}) => { const i = ++id; ws.send(JSON.stringify({ id: i, method, params })); return new Promise((r) => pending.set(i, r)); };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: `(async () => (${expr}))()`, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 500)); return r.result?.value; };
  const key = async (code, ms = 80) => {
    const k = code.replace(/^Key/, '');
    await send('Input.dispatchKeyEvent', { type: 'keyDown', code, key: k.toLowerCase(), windowsVirtualKeyCode: k.charCodeAt(0) });
    await sleep(ms);
    await send('Input.dispatchKeyEvent', { type: 'keyUp', code, key: k.toLowerCase(), windowsVirtualKeyCode: k.charCodeAt(0) });
  };
  const shot = async (file) => { const s = await send('Page.captureScreenshot', { format: 'png' }); if (s.data) writeFileSync(file, Buffer.from(s.data, 'base64')); };
  const waitFor = async (expr, ms = 90000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await ev(expr)) return true; } catch { /* page still loading */ } await sleep(500); } return false; };
  return { ev, key, shot, waitFor, errors, close: () => ws.close() };
}

const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + String(detail).slice(0, 220) : ''}`); };
const hero = (name, cls) => `(async () => {
  const core = await import('/src/core/index.ts');
  const { defaultLook } = await import('/src/data/classes/hc/index.ts');
  const st = core.createNewGameState(0);
  st.player.name = ${JSON.stringify(name)};
  st.player.hero = { classId: ${JSON.stringify(cls)}, look: defaultLook(${JSON.stringify(cls)}, 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
  core.Game.set(st);
  return true;
})()`;
const enter = (T) => T.ev(`(async () => {
  const coop = await import('/src/net/coop/index.ts');
  const list = await coop.browseRealms();
  const r = list.find((x) => x.rule === 'duels');
  await coop.enterRealm(r);
  window.__game.scene.getScene('MainMenu').scene.start('WorldV2', { realm: { id: r.id, space: r.space, rule: r.rule, name: r.name } });
  return (await import('/src/core/index.ts')).Services.get('net').localPlayer;
})()`);
const events = (T) => T.ev(`(async () => { const c = await import('/src/core/index.ts'); window.__duel = []; for (const e of ['duel:asked', 'duel:started', 'duel:ended']) c.bus.on(e, (p) => window.__duel.push([e, p])); return 1; })()`);

try {
  for (let i = 0; i < 40; i++) { await sleep(250); try { await fetch(`http://127.0.0.1:${PORT}/json/version`); break; } catch {} }
  const A = await tab(`${BASE}/`), B = await tab(`${BASE}/`);
  check('both titles up', (await A.waitFor(`!!window.__game?.scene.isActive('MainMenu')`)) && (await B.waitFor(`!!window.__game?.scene.isActive('MainMenu')`)));
  await A.ev(hero('Ana', 'warden')); await B.ev(hero('Bo', 'samurai'));
  await events(A); await events(B);
  const aId = await enter(A); const bId = await enter(B);
  check('both entered the Duels realm', !!aId && !!bId && aId !== bId, JSON.stringify({ aId, bId }));
  check('both in WorldV2', (await A.waitFor(`!!window.__game.scene.isActive('HudV2')`)) && (await B.waitFor(`!!window.__game.scene.isActive('HudV2')`)));
  await sleep(4000);
  // A challenges B through the chat command, exactly as a player would type it
  await A.ev(`(() => { window.__game.scene.getScene('HudV2').chat.send('/duel Bo'); return 1; })()`);
  check('B is asked', await B.waitFor(`(window.__duel || []).some(([e]) => e === 'duel:asked')`, 15000), JSON.stringify(await B.ev('window.__duel')));
  await sleep(600);
  await B.shot(join(OUT, 'duel-ask.png'));
  // B clicks Accept on the prompt (gold button at centre-left of the prompt)
  await B.ev(`(() => { const h = window.__game.scene.getScene('HudV2'); const btn = h.children.list.flatMap((o) => o.list ?? [o]).find((o) => o.type === 'NineSlice' && o.texture?.key === 'ui:btn_gold' && o.y > 140 && o.y < 260); btn?.emit('pointerup'); return !!btn; })()`);
  check('duel started on both sides', (await A.waitFor(`(window.__duel || []).some(([e]) => e === 'duel:started')`, 15000)) && (await B.waitFor(`(window.__duel || []).some(([e]) => e === 'duel:started')`, 15000)));
  await sleep(800);
  await A.shot(join(OUT, 'duel-start.png'));
  const errs = [...A.errors, ...B.errors].filter((e) => !/auth\/|firestore|Firebase/i.test(e ?? ''));
  check('no page errors', !errs.length, errs.slice(0, 3).join(' || '));
} catch (e) { check('harness', false, String(e)); }
chrome.kill('SIGKILL');
const failed = results.filter((x) => !x).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
