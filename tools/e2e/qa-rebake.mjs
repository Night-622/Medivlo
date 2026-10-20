// QA (Claude 7): hero sheets re-baked while on screen must never leave a sprite on a removed texture. Live error
// reports (Firestore clientErrors, Mac build v0.9.0) showed "Cannot read properties of null (reading 'sourceSize')"
// and "(reading 'glTexture')": a texture removed under a sprite that still draws it throws every frame.
//  1. character creation: 72 fast class changes with ↑/↓ (each re-bakes the preview under one key)
//  2. in the world: equip / unequip a helm and a chest 12 times while walking (each re-bakes the hero sheet)
// PASS = none of those errors, no page errors, and the game loop keeps advancing.
//   node tools/e2e/qa-rebake.mjs [--base http://localhost:5170] [--out tools/e2e/out/qa]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5170'), OUT = arg('out', 'tools/e2e/out/qa');
mkdirSync(OUT, { recursive: true });
let fails = 0, total = 0;
const check = (what, ok, detail = '') => { total++; if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'} ${what}${detail ? ` :: ${String(detail).slice(0, 260)}` : ''}`); };
const page = await launch({ port: 9300 + Math.floor(Math.random() * 100) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const ev = (e) => page.eval(e);
const waitFor = async (expr, ms = 90000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (await ev(expr)) return true; } catch { /* loading */ } await sleep(300); } return false; };
const ticking = () => ev('(async () => { const n0 = window.__game.loop.frame; await new Promise((r) => setTimeout(r, 800)); return window.__game.loop.frame - n0; })()');
const texErrors = () => errors.filter((e) => /sourceSize|glTexture/.test(e));

try {
  await page.goto(`${BASE}/`);
  await waitFor(`!!window.__game?.scene.isActive('MainMenu')`);
  await sleep(1200);
  await page.press('Enter');
  await waitFor(`!!window.__game.scene.isActive('CharacterCreate')`, 20000);
  await sleep(1500);
  for (let i = 0; i < 48; i++) { await page.press('ArrowDown', 20); await sleep(30); }
  for (let i = 0; i < 24; i++) { await page.press('ArrowUp', 20); await sleep(30); }
  await sleep(800);
  const f1 = await ticking();
  check('character creation: 72 fast class changes leave no sprite on a removed texture', texErrors().length === 0 && f1 > 0, `frames in 0.8 s: ${f1}; ${texErrors().slice(0, 2).join(' | ')}`);
  await page.screenshot(`${OUT}/rebake-create.png`);
  await page.press('Enter');
  await waitFor('!!(window.__hc && window.__hc.local())', 120000);
  await sleep(2500);
  for (let i = 0; i < 30; i++) { const a = await ev(`(async () => (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient.active)()`); if (!a) break; await page.press('Space'); await sleep(300); }
  const school = await ev(`(async () => (await import('/src/core/index.ts')).classSchool((await import('/src/core/index.ts')).Game.state.player.hero.classId))()`);
  const got = await ev(`(async () => { window.__hc.give('a_' + ${JSON.stringify(school)} + '_plate_helm', 1); window.__hc.give('a_' + ${JSON.stringify(school)} + '_plate_chest', 1); await new Promise((r) => setTimeout(r, 600));
    return window.__hc.character().inventory.filter((x) => /_plate_(helm|chest)$/.test(x.base)).map((x) => ({ uid: x.uid, base: x.base })); })()`);
  check('the test gear is in the pack', got.length >= 1, JSON.stringify(got));
  for (let i = 0; i < 12; i++) {
    await page.keyDown(i % 2 ? 'KeyA' : 'KeyD');
    await ev(`(async () => { const ch = await import('/src/systems/client/character.ts'); const inv = ch.character().inventory;
      for (const it of inv.filter((x) => /_plate_(helm|chest)$/.test(x.base))) ch.equip(it.uid);
      ch.sendLoadout(); ch.changed(); return 1; })()`);
    await sleep(250);
    await ev(`(async () => { const ch = await import('/src/systems/client/character.ts'); ch.unequip('helm'); ch.unequip('chest'); ch.sendLoadout(); ch.changed(); return 1; })()`);
    await sleep(250);
    await page.keyUp(i % 2 ? 'KeyA' : 'KeyD');
  }
  await sleep(800);
  const f2 = await ticking();
  const lk = await ev(`(() => { const s = window.__hc.sprite(); return { key: s.key, anim: s.anim, visible: s.visible }; })()`);
  check('in the world: 24 gear changes while walking leave no sprite on a removed texture', texErrors().length === 0 && f2 > 0 && lk.visible, `frames in 0.8 s: ${f2}; sprite ${JSON.stringify(lk)}; ${texErrors().slice(0, 2).join(' | ')}`);
  await page.screenshot(`${OUT}/rebake-world.png`);
} catch (e) { check('harness', false, String(e)); }
const errs = errors.filter((e) => !/auth\/|firestore|Firebase/i.test(e));
check('no page errors', !errs.length, errs.slice(0, 4).join(' | '));
await page.close();
console.log(`\n${total - fails}/${total} passed`);
process.exit(fails ? 1 : 0);
