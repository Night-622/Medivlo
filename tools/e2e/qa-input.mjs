// QA (Claude 7): input traps a real player meets. Real keyboard/mouse over CDP, oracle = the InputFrames the client
// sends to the sim (wrapped net.send) and which screens are open.
//  1. alt-tab while walking: keys held across a blur/hidden tab are released (the hero doesn't walk on by itself)
//  2. rebinding: arrows for movement, dash on Shift; the old keys stop working; Pause on another key (Esc swaps to
//     People): one press opens one screen
//  3. F5 (HudV2 "save") must not also reload the page (default prevented), or not be bound at all
//  4. Settings › Fullscreen follows the real state after the browser leaves fullscreen
//  5. resizing the window: the canvas keeps 16:9 inside the viewport and HUD buttons still take clicks
//  6. Large text: the HUD still lays out inside the screen
//   node tools/e2e/qa-input.mjs [--base http://localhost:5170] [--class warden] [--out tools/e2e/out/qa]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5170'), OUT = arg('out', 'tools/e2e/out/qa'), CLS = arg('class', 'warden');
const SCHOOL = { warden: 'rime', rimecaller: 'rime', reaver: 'ash', arcanist: 'ash', knight: 'iron', monk: 'fist' }[CLS] ?? 'rime';
mkdirSync(OUT, { recursive: true });
let fails = 0, total = 0;
const check = (what, ok, detail = '') => { total++; if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'} ${what}${detail ? ` :: ${String(detail).slice(0, 260)}` : ''}`); };

const page = await launch({ port: 9400 + Math.floor(Math.random() * 200) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const waitFor = async (fn, ms = 15000) => { const t = Date.now(); while (Date.now() - t < ms) { let v; try { v = await fn(); } catch { /* loading */ } if (v) return v; await sleep(300); } return null; };
const core = (body) => page.eval(`(async () => { const c = await import('/src/core/index.ts'); ${body} })()`);
const frame = () => page.eval('window.__qa?.last ?? null');
const opened = () => page.eval('window.__qa.ui.splice(0)');
const active = (k) => page.eval(`window.__game.scene.isActive(${JSON.stringify(k)})`);
const endDialogue = async () => {
  for (let i = 0; i < 40; i++) {
    const n = await page.eval(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; return d.active ? d.view.choices.length : -1; })()`);
    if (n < 0) return;
    await page.press(n > 0 ? 'Digit1' : 'Space', 60);
    await sleep(350);
  }
};
// close whatever full screen is up with Esc until the world has the keyboard again
const toWorld = async () => { for (let i = 0; i < 4; i++) { if (!(await active('Pause')) && !(await page.eval('!!window.__hud?.().panelOpen'))) return; await page.press('Escape'); await sleep(400); } };
const BTN = {};

try {
  await page.goto(`${BASE}/?scene=WorldV2&space=realm:${SCHOOL}&hc_class=${CLS}`);
  check('world up', !!(await waitFor(() => page.eval('!!(window.__hc && window.__hc.local() && window.__hud)'), 120000)));
  await sleep(1500);
  await endDialogue();
  // record every InputFrame the client sends, and every ui:open
  await core(`
    const net = c.Services.get('net'); const send = net.send.bind(net);
    window.__qa = { last: null, ui: [] };
    net.send = (m) => { if (m.type === 'input') window.__qa.last = m.frames[m.frames.length - 1]; return send(m); };
    c.bus.on('ui:open', (e) => window.__qa.ui.push(e.panel));
    window.__qa.Btn = (await import('/src/net/types.ts')).Btn;
  `);
  Object.assign(BTN, await page.eval('window.__qa.Btn'));
  await sleep(500);

  // ── 1. alt-tab while walking ──
  await page.keyDown('KeyD'); await sleep(600);
  const walking = await frame();
  check('holding D walks (input frame move.x > 0)', walking?.move?.x > 0.5, JSON.stringify(walking?.move));
  // the OS swallows the key-up while another window has focus: blur + hidden, no keyUp, then come back
  await page.eval(`(() => {
    window.dispatchEvent(new Event('blur'));
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange')); return 1; })()`);
  await sleep(500);
  await page.eval(`(() => {
    delete document.visibilityState; delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus')); return 1; })()`);
  await sleep(800);
  const p0 = await page.eval('window.__hc.local()');
  await sleep(1000);
  const p1 = await page.eval('window.__hc.local()');
  const after = await frame();
  check('after alt-tab the held key is released (no move in the input)', after && after.move.x === 0 && after.move.y === 0, JSON.stringify(after?.move));
  check('after alt-tab the hero stands still', Math.hypot(p1.x - p0.x, p1.y - p0.y) < 4, `moved ${Math.round(Math.hypot(p1.x - p0.x, p1.y - p0.y))} px in 1 s`);
  await page.keyUp('KeyD');
  await page.screenshot(`${OUT}/input-alttab.png`);

  // ── 2. rebinding ──
  await core(`for (const [a, k] of [['up','UP'],['down','DOWN'],['left','LEFT'],['right','RIGHT'],['dash','SHIFT']]) c.Settings.bind(a, k);`);
  await sleep(300);
  await page.keyDown('ArrowRight'); await sleep(400);
  const arrow = await frame(); await page.keyUp('ArrowRight'); await sleep(200);
  check('rebound: ArrowRight walks right', arrow?.move?.x > 0.5, JSON.stringify(arrow?.move));
  await page.keyDown('KeyD'); await sleep(400);
  const oldKey = await frame(); await page.keyUp('KeyD'); await sleep(200);
  check('rebound: D no longer walks', oldKey && oldKey.move.x === 0, JSON.stringify(oldKey?.move));
  await page.keyDown('ShiftLeft'); await sleep(150);
  const dash = await frame(); await page.keyUp('ShiftLeft'); await sleep(200);
  check('rebound: Shift dashes', !!dash && (dash.buttons & BTN.DASH) !== 0, `buttons ${dash?.buttons}`);
  await page.keyDown('Space'); await sleep(150);
  const space = await frame(); await page.keyUp('Space'); await sleep(200);
  check('rebound: Space no longer dashes', !!space && (space.buttons & BTN.DASH) === 0, `buttons ${space?.buttons}`);
  // Pause on P: Settings.bind swaps, so People takes Esc. Esc is also the universal back key.
  await core(`c.Settings.bind('pause', 'P');`);
  await opened(); await sleep(200);
  await page.press('KeyP'); await sleep(700);
  check('rebound: P opens Pause', await active('Pause'));
  await page.press('Escape'); await sleep(700);
  check('Esc closes Pause', !(await active('Pause')));
  await opened();
  await page.press('Escape'); await sleep(900);
  const both = { pause: await active('Pause'), people: await active('People'), opened: await opened() };
  check('Esc with People bound to Esc opens one screen, not two', Number(both.pause) + Number(both.people) <= 1, JSON.stringify(both));
  await page.screenshot(`${OUT}/input-esc-swap.png`);
  for (let i = 0; i < 3 && ((await active('Pause')) || (await active('People'))); i++) { await page.press('Escape'); await sleep(500); }
  await core('c.Settings.reset();');
  await sleep(400);

  // ── People (P) in a school realm lists that realm's people, not Brindlecross ──
  await page.press('KeyP'); await sleep(1200);
  const ppl = await page.eval(`(async () => { const { markerAt } = await import('/src/world/hc/spawns.ts'); const s = window.__game.scene.getScene('People'); const sp = window.__world.where().space;
    const list = s.people ?? []; return { n: list.length, here: list.filter((n) => markerAt(n.home)?.space === sp).length, realm: s.realm ?? null, space: sp }; })()`);
  check('People in a school realm lists the people of that realm', ppl.n > 0 && ppl.here === ppl.n, JSON.stringify(ppl));
  await page.screenshot(`${OUT}/input-people-realm.png`);
  await page.press('Escape'); await sleep(500);

  // ── 3. F5 ──
  await page.eval(`(() => { window.__qa.f5 = null; window.addEventListener('keydown', (e) => { if (e.key === 'F5') window.__qa.f5 = e.defaultPrevented; }); return 1; })()`);
  await page.eval(`(() => { const e = new KeyboardEvent('keydown', { key: 'F5', code: 'F5', keyCode: 116, which: 116, bubbles: true, cancelable: true }); window.dispatchEvent(e); return 1; })()`);
  await sleep(300);
  const f5 = await page.eval('window.__qa.f5');
  const f5bound = await page.eval(`(() => { const kb = window.__game.scene.getScene('HudV2').input.keyboard; return kb.listenerCount('keydown-F5'); })()`);
  check('F5 is not a hidden save key that also reloads the page', f5bound === 0 || f5 === true, `keydown-F5 listeners ${f5bound}, default prevented ${f5}`);

  // ── 4. fullscreen follows the browser ──
  const fs = await page.send('Runtime.evaluate', { expression: `(async () => { const c = await import('/src/core/index.ts'); c.Settings.set('fullscreen', true); window.__game.scale.startFullscreen(); await new Promise((r) => setTimeout(r, 600)); const inFs = !!document.fullscreenElement; await document.exitFullscreen().catch(() => undefined); await new Promise((r) => setTimeout(r, 600)); return { inFs, after: !!document.fullscreenElement, setting: c.Settings.get().fullscreen }; })()`, awaitPromise: true, returnByValue: true, userGesture: true });
  const fv = fs.result?.value;
  if (fv?.inFs) check('Settings › Fullscreen reads Off after the browser leaves fullscreen', fv.setting === fv.after, JSON.stringify(fv));
  else console.log(`note fullscreen not available in this browser (${JSON.stringify(fv ?? fs.exceptionDetails?.exception?.description)})`);
  await core(`c.Settings.set('fullscreen', false);`);

  // ── 5. resize: canvas keeps 16:9 inside the viewport; HUD buttons still take clicks ──
  for (const [w, h] of [[1920, 1080], [1000, 800], [1600, 700], [1280, 720]]) {
    await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await sleep(900);
    const r = await page.eval(`(() => { const c = window.__game.canvas.getBoundingClientRect(); return { x: c.left, y: c.top, w: c.width, h: c.height }; })()`);
    const fits = r.x >= -1 && r.y >= -1 && r.x + r.w <= w + 1 && r.y + r.h <= h + 1;
    const fills = Math.abs(r.w - w) <= 2 || Math.abs(r.h - h) <= 2;
    check(`${w}×${h}: canvas fits the window, 16:9, touching two edges`, fits && fills && Math.abs(r.w / r.h - 16 / 9) < 0.02, JSON.stringify(r));
    const btn = (await page.eval('window.__hud()')).buttons.find((b) => b.panel === 'inventory') ?? (await page.eval('window.__hud()')).buttons[0];
    await opened();
    await page.click(btn.click.x, btn.click.y); await sleep(700);
    const ui = await opened();
    check(`${w}×${h}: clicking the ${btn.panel} button opens it`, ui.includes(btn.panel), `clicked ${btn.click.x},${btn.click.y} → ${JSON.stringify(ui)}`);
    await page.screenshot(`${OUT}/input-resize-${w}x${h}.png`);
    await toWorld();
  }

  // ── 6. Large text: the HUD still fits ──
  await core(`c.Settings.set('textSize', 'large');`);
  await sleep(800);
  const h = await page.eval('window.__hud()');
  const outside = (h.texts ?? []).filter((t) => t.b.x < 0 || t.b.y < 0 || t.b.x + t.b.w > h.size.w || t.b.y + t.b.h > h.size.h).map((t) => t.text.slice(0, 20));
  check('Large text: every HUD text inside the screen', outside.length === 0, outside.join(' | '));
  await page.screenshot(`${OUT}/input-large-text.png`);
  await core(`c.Settings.reset();`);
} catch (e) { check('harness', false, String(e)); }
const errs = errors.filter((e) => !/auth\/|firestore|Firebase/i.test(e));
check('no console errors', !errs.length, errs.slice(0, 4).join(' | '));
await page.close();
console.log(`\n${total - fails}/${total} passed`);
process.exit(fails ? 1 : 0);
