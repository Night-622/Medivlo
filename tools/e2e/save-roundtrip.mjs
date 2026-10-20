// Save/load round-trip test against the real game in headless Chrome via CDP (Node 24 built-in WebSocket).
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { acquireChrome, CHROME_PATH } from './chrome-lock.mjs';

const BASE = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'http://localhost:5199';
const CHROME = CHROME_PATH;
const PORT = 9333;
const profile = mkdtempSync(join(process.env.SCRATCH ?? tmpdir(), 'cdp-'));
await acquireChrome('save-roundtrip'); // one headless Chrome at a time across all agents (tools/e2e/chrome-lock.mjs)
const chrome = spawn(CHROME, ['--headless=new', '--mute-audio', '--disable-gpu', '--use-angle=swiftshader', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--window-size=1280,720', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ws, id = 0;
const pending = new Map();
function send(method, params = {}) {
  const msgId = ++id;
  ws.send(JSON.stringify({ id: msgId, method, params }));
  return new Promise((res, rej) => pending.set(msgId, { res, rej }));
}
async function evalJs(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.error) throw new Error('CDP: ' + JSON.stringify(r.error));
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 800));
  return r.result.value;
}
async function goto(url, waitMs) { await send('Page.navigate', { url }); await sleep(waitMs); }
async function click(x, y) {
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
    await sleep(150);
  }
}

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`); };

try {
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(250);
    try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* not up yet */ }
  }
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result ?? m); pending.delete(m.id); } };
  await send('Page.enable'); await send('Runtime.enable'); await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });

  // 1) a Hollow Crown hero in WorldV2, mutate state, save (Hollow Crown save keys; gold lives on the systems character)
  await goto(`${BASE}/?scene=MainMenu`, 15000);
  await evalJs(`(async () => {
    const core = await import('/src/core/index.ts');
    const { defaultLook } = await import('/src/data/classes/hc/index.ts');
    const st = core.createNewGameState(0);
    st.player.name = 'Savetest';
    st.player.hero = { classId: 'warden', look: defaultLook('warden', 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
    core.Game.set(st);
    window.__game.scene.getScene('MainMenu').scene.start('WorldV2');
  })()`);
  await sleep(20000);
  const saved = await evalJs(`(async () => {
    const core = await import('/src/core/index.ts');
    const { SaveService } = await import('/src/firebase/SaveService.ts');
    const s = core.Game.state;
    s.character.gold = 777;
    s.character.xp = 42;
    core.setFlag('test.roundtrip', 'yes');
    s.narrative.codexUnlocked.push('lore:the-white-stag');
    s.meta.playtimeSec = 3723;
    await SaveService.save(s);
    return { slot: s.meta.slot, json: JSON.stringify(s), keys: Object.keys(localStorage), loc: s.world.location };
  })()`);
  check('save writes localStorage', saved.keys.includes(`hollowcrown.save.${saved.slot}`), saved.keys.join(','));

  // 2) reload to main menu, list + load
  await goto(`${BASE}/?scene=MainMenu`, 15000);
  const loaded = await evalJs(`(async () => {
    const { SaveService } = await import('/src/firebase/SaveService.ts');
    const list = SaveService.listLocal();
    const st = await SaveService.load(${saved.slot});
    return { list, json: JSON.stringify(st) };
  })()`);
  const a = JSON.parse(saved.json), b = JSON.parse(loaded.json);
  delete a.meta.updatedAt; delete b.meta.updatedAt; delete a.meta.playtimeSec; delete b.meta.playtimeSec; // both tick with real time (autosave)
  check('listLocal shows the save', !!loaded.list[saved.slot] && loaded.list[saved.slot].name === 'Savetest', JSON.stringify(loaded.list[saved.slot]));
  const diff = (x, y, path = '') => {
    if (JSON.stringify(x) === JSON.stringify(y)) return null;
    if (x && y && typeof x === 'object' && typeof y === 'object') { for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) { const d = diff(x[k], y[k], `${path}.${k}`); if (d) return d; } }
    return `${path}: ${JSON.stringify(x)?.slice(0, 120)} → ${JSON.stringify(y)?.slice(0, 120)}`;
  };
  check('load round-trips the full GameState', JSON.stringify(a) === JSON.stringify(b), diff(a, b) ?? '');
  check('flag survives', b.flags['test.roundtrip'] === 'yes');
  check('gold/xp/codex survive', b.character?.gold === 777 && b.character?.xp === 42 && b.narrative.codexUnlocked.includes('lore:the-white-stag'));

  // 3) Continue button on the real menu → world restores the saved state
  await click(216, 344);
  await sleep(20000);
  const after = await evalJs(`(async () => {
    const core = await import('/src/core/index.ts');
    const s = core.Game.state;
    return { name: s.player.name, gold: s.character?.gold, loc: s.world.location, px: null };
  })()`);
  check('Continue loads the save into the game', after.name === 'Savetest' && after.gold === 777, JSON.stringify(after));
  check('world location restored', after.loc.space === saved.loc.space && saved.loc.x > 0 && Math.abs(after.loc.x - saved.loc.x) < 64 && Math.abs(after.loc.y - saved.loc.y) < 64, `saved ${JSON.stringify(saved.loc)} now ${JSON.stringify(after.loc)} player ${JSON.stringify(after.px)}`);
} catch (e) {
  check('harness', false, String(e).slice(0, 600));
} finally {
  ws?.close();
  chrome.kill();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
}
