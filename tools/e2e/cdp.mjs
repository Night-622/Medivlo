// Minimal Chrome DevTools Protocol driver (Node ≥ 22 built-in WebSocket, no deps).
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { acquireChrome, CHROME_PATH } from './chrome-lock.mjs';
import { join } from 'node:path';

const CHROME = CHROME_PATH;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const KEYCODES = { Space: 32, Escape: 27, Enter: 13, Tab: 9, ShiftLeft: 16, Backspace: 8, ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39 };
function keyInfo(code) {
  if (KEYCODES[code] !== undefined) return { key: code === 'Space' ? ' ' : code === 'ShiftLeft' ? 'Shift' : code, keyCode: KEYCODES[code] };
  if (/^Key[A-Z]$/.test(code)) return { key: code.slice(3).toLowerCase(), keyCode: code.charCodeAt(3) };
  if (/^Digit\d$/.test(code)) return { key: code.slice(5), keyCode: 48 + Number(code.slice(5)) };
  throw new Error(`unknown key ${code}`);
}

export async function launch({ port = 9340, width = 1280, height = 720, profileRoot = tmpdir(), dpr = Number(process.env.DPR ?? 1) } = {}) {
  const releaseChrome = await acquireChrome('cdp'); // one headless Chrome at a time across all agents
  const profile = mkdtempSync(join(profileRoot, 'e2e-chrome-'));
  const chrome = spawn(CHROME, [
    '--headless=new', '--mute-audio', `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, `--window-size=${width},${height}`, '--autoplay-policy=no-user-gesture-required',
    // keep rAF and timers at full rate in headless (same as Puppeteer defaults)
    '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows',
    '--disable-features=CalculateNativeWinOcclusion,Translate,BackForwardCache', '--disable-ipc-flooding-protection', '--disable-hang-monitor',
    '--enable-automation', '--no-first-run', '--disable-default-apps', '--disable-extensions', '--disable-sync', '--disable-popup-blocking',
    '--disable-background-networking', '--disable-client-side-phishing-detection', '--metrics-recording-only', '--password-store=basic', '--use-mock-keychain',
    '--force-color-profile=srgb', 'about:blank',
  ], { stdio: 'ignore' });
  let target;
  for (let i = 0; i < 80 && !target; i++) {
    await sleep(250);
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* starting */ }
  }
  if (!target) throw new Error('chrome did not start');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m); pending.delete(m.id); }
    else if (m.method) for (const l of listeners) l(m);
  };
  let closed = false;
  ws.onclose = () => { closed = true; for (const res of pending.values()) res({ exceptionDetails: { exception: { description: 'chrome connection closed' } } }); pending.clear(); };
  // a dead browser must fail the step, not hang the run (unsettled promises exit Node with code 13)
  const send = (method, params = {}) => new Promise((res) => {
    if (closed) { res({ exceptionDetails: { exception: { description: 'chrome connection closed' } } }); return; }
    const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params }));
    setTimeout(() => { if (pending.has(i)) { pending.delete(i); res({ exceptionDetails: { exception: { description: `cdp timeout: ${method}` } } }); } }, 60_000);
  });
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile: false });
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Page.bringToFront');

  const api = {
    send,
    on: (fn) => listeners.push(fn),
    async eval(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(`page: ${r.exceptionDetails.exception?.description ?? JSON.stringify(r.exceptionDetails).slice(0, 400)}`);
      return r.result?.value;
    },
    async goto(url) { await send('Page.navigate', { url }); },
    async keyDown(code) { const k = keyInfo(code); await send('Input.dispatchKeyEvent', { type: 'keyDown', code, key: k.key, windowsVirtualKeyCode: k.keyCode, nativeVirtualKeyCode: k.keyCode, text: k.key.length === 1 ? k.key : undefined }); },
    async keyUp(code) { const k = keyInfo(code); await send('Input.dispatchKeyEvent', { type: 'keyUp', code, key: k.key, windowsVirtualKeyCode: k.keyCode, nativeVirtualKeyCode: k.keyCode }); },
    async press(code, holdMs = 70) { await api.keyDown(code); await sleep(holdMs); await api.keyUp(code); },
    async hold(codes, ms) { for (const c of codes) await api.keyDown(c); await sleep(ms); for (const c of codes) await api.keyUp(c); },
    async mouseMove(x, y) { await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, buttons: api._buttons ?? 0 }); },
    async mouseDown(x, y, button = 'left') { api._buttons = button === 'left' ? 1 : 2; await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button, buttons: api._buttons, clickCount: 1 }); },
    async mouseUp(x, y, button = 'left') { api._buttons = 0; await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button, buttons: 0, clickCount: 1 }); },
    async click(x, y, button = 'left', holdMs = 60) { await api.mouseMove(x, y); await api.mouseDown(x, y, button); await sleep(holdMs); await api.mouseUp(x, y, button); },
    async screenshot(path) { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(path, Buffer.from(r.data, 'base64')); },
    async close() { try { ws.close(); } catch { /* */ } chrome.kill('SIGKILL'); releaseChrome(); },
  };
  return api;
}
