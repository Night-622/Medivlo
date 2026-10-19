// Screenshot any game URL in headless Chrome at 1280x720 and print page errors.
// Usage: node tools/e2e/shot.mjs <url> <out.png> [waitMs]   (env CLICKS="x,y;x,y" clicks in order before the shot)
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { acquireChrome, CHROME_PATH } from './chrome-lock.mjs';
const [url, out, wait = '20000'] = process.argv.slice(2);
const PORT = 9300 + Math.floor(Math.random() * 600);
await acquireChrome('shot'); // one headless Chrome at a time across all agents (tools/e2e/chrome-lock.mjs)
setTimeout(() => { console.log('TIMEOUT'); try { chrome.kill(); } catch {} process.exit(2); }, +wait + 90000).unref();
const chrome = spawn(CHROME_PATH, ['--headless=new', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(process.env.SCRATCH ?? tmpdir(), 'cdp-'))}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0; const pending = new Map();
const send = (method, params = {}) => { const i = ++id; ws.send(JSON.stringify({ id: i, method, params })); return new Promise((r) => pending.set(i, r)); };
try {
  let t; for (let i = 0; i < 40 && !t; i++) { await sleep(250); try { t = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((x) => x.type === 'page'); } catch {} }
  ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result ?? d); pending.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') console.log('EXC', JSON.stringify(d.params.exceptionDetails).slice(0, 600));
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') console.log('ERR', d.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 400)); };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: Number(process.env.DPR ?? 1), mobile: false });
  await send('Page.navigate', { url }); await sleep(+wait);
  for (const c of (process.env.CLICKS ?? '').split(';').filter(Boolean)) {
    const [x, y] = c.split(',').map(Number);
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) { await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }); await sleep(400); }
    await sleep(2500);
  }
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('saved', out);
} finally { ws?.close(); chrome.kill(); process.exit(0); }
