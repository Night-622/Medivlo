// A brand-new player with real input only (Claude 1): fresh profile → title → click New Game → clear the random
// name, type one, Enter → WorldV2 in the class's start realm → finish the opening narration → walk with D.
// Checks the hero, the start space, the save slot, movement, and no page errors.
//   npx vite --config tools/e2e/vite.test.config.mjs ; node tools/e2e/new-player.mjs [--out dir]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5199');
const OUT = arg('out', 'tools/e2e/out');
mkdirSync(OUT, { recursive: true });
const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${String(detail).slice(0, 220)}` : ''}`); };
const page = await launch({ port: 9600 + Math.floor(Math.random() * 100) });
const errors = [];
page.on((m) => { if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n').slice(0, 5).join(' < ') ?? 'exception'); });
const waitFor = async (expr, ms = 90000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (await page.eval(expr)) return true; } catch { /* loading */ } await sleep(400); } return false; };
const core = `(await import('/src/core/index.ts'))`;

try {
  await page.goto(`${BASE}/`);
  check('title up', await waitFor(`!!window.__game?.scene.isActive('MainMenu')`));
  await sleep(1500);
  await page.screenshot(`${OUT}/np-title.png`);
  await page.click(250, 404); // New Game (Continue is disabled on a fresh profile)
  check('New Game → character creation', await waitFor(`!!window.__game.scene.isActive('CharacterCreate')`, 30000));
  await sleep(2500);
  await page.screenshot(`${OUT}/np-create.png`);
  // click a different hero, then back: the preview re-render used to freeze the game (user report 2026-10-20)
  await page.click(218, 292); await sleep(1500);
  await page.click(218, 222); await sleep(1500);
  check('switching heroes keeps the game running', await page.eval(`(async () => { const n0 = window.__game.loop.frame; await new Promise((r) => setTimeout(r, 800)); return window.__game.loop.frame > n0; })()`));
  for (let i = 0; i < 14; i++) await page.press('Backspace', 30);
  for (const ch of 'Tess') await page.press(`Key${ch.toUpperCase()}`, 30);
  await page.press('Enter', 60);
  check('Begin → world', await waitFor(`!!window.__game.scene.isActive('HudV2')`, 90000));
  const st = await page.eval(`(async () => { const c = ${core}; const s = c.Game.state; return { name: s.player.name, cls: s.player.hero?.classId, mirror: s.player.progression.classId, space: s.world.location.space }; })()`);
  check('hero created from the screen', st.name.toLowerCase() === 'tess' && !!st.cls && st.mirror === `class:${st.cls}`, JSON.stringify(st));
  await sleep(4000);
  const start = await page.eval(`(() => window.__game.scene.getScene('WorldV2').space)()`);
  check('starts in a school realm', /^realm:/.test(start ?? ''), start);
  const saved = await page.eval(`(async () => (await import('/src/firebase/SaveService.ts')).SaveService.listLocal().filter(Boolean).map((s) => s.name + ':' + s.classId))()`);
  check('saved to a slot', saved.some((s) => s.toLowerCase().startsWith('tess:')), JSON.stringify(saved));
  await page.screenshot(`${OUT}/np-opening.png`);
  // the opening narration: advance it like a player (Space; pick 1 when there are choices)
  for (let i = 0; i < 30; i++) {
    const n = await page.eval(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; return d.active ? d.view.choices.length : -1; })()`);
    if (n < 0) break;
    await page.press(n > 0 ? 'Digit1' : 'Space', 60);
    await sleep(500);
  }
  check('opening conversation can be finished with keys', await page.eval(`(async () => !(await import('/src/narrative/client/dialogueClient.ts')).dialogueClient.active)()`));
  const p0 = await page.eval(`window.__hc?.local?.()`);
  await page.hold(['KeyD'], 1000);
  await sleep(500);
  const p1 = await page.eval(`window.__hc?.local?.()`);
  check('WASD moves the hero', !!p0 && !!p1 && p1.x - p0.x > 20, JSON.stringify({ p0: p0 && [p0.x, p0.y], p1: p1 && [p1.x, p1.y] }));
  await page.screenshot(`${OUT}/np-walk.png`);
  // play time ticks, and leaving the tab writes the save immediately (autosave)
  const pt = await page.eval(`(async () => (await import('/src/core/index.ts')).Game.state.meta.playtimeSec)()`);
  check('play time is counted', pt >= 5, `${pt}s`);
  const before = await page.eval(`JSON.parse(localStorage.getItem('hollowcrown.save.0') ?? '{}').meta?.updatedAt ?? 0`);
  await page.eval(`(document.dispatchEvent(new Event('visibilitychange')), window.dispatchEvent(new Event('pagehide')), 1)`);
  await sleep(300);
  const after = await page.eval(`JSON.parse(localStorage.getItem('hollowcrown.save.0') ?? '{}').meta?.updatedAt ?? 0`);
  check('leaving the page saves immediately', after > before, JSON.stringify({ before, after }));
} catch (e) { check('harness', false, String(e)); }
const errs = errors.filter((e) => !/auth\/|firestore|Firebase/i.test(e));
check('no page errors', !errs.length, errs.slice(0, 4).join(' | '));
await page.close();
const failed = results.filter((x) => !x).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
