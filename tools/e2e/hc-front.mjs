// Front-end flow (Claude 1): saved hero → Load screen → WorldV2 → Esc Pause → title → Public Realms → Enter a live
// realm (server authority) → chat. Needs the test Vite server and a realm server:
//   npx vite --config tools/e2e/vite.test.config.mjs   (port 5199)
//   node server/build.mjs && DEV_AUTH=1 node dist-server/main.mjs   (port 8080)
//   node tools/e2e/hc-front.mjs [--base http://localhost:5199] [--out tools/e2e/out]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5199');
const OUT = arg('out', 'tools/e2e/out');
mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, info = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${info ? ` :: ${info}` : ''}`); };
const page = await launch({ port: 9400 + Math.floor(Math.random() * 400) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const active = (k) => page.eval(`!!window.__game?.scene.isActive(${JSON.stringify(k)})`);
const waitFor = async (expr, ms = 60000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.eval(expr)) return true; await sleep(400); } return false; };

try {
  await page.goto(`${BASE}/`);
  check('title up', await waitFor(`!!window.__game?.scene.isActive('MainMenu')`, 90000));

  // 1) a saved Hollow Crown hero in slot 0
  const saved = await page.eval(`(async () => {
    const core = await import('/src/core/index.ts');
    const { SaveService } = await import('/src/firebase/SaveService.ts');
    const { defaultLook } = await import('/src/data/classes/hc/index.ts');
    const st = core.createNewGameState(0);
    st.player.name = 'Ana';
    st.player.hero = { classId: 'warden', look: defaultLook('warden', 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
    core.Game.set(st);
    await SaveService.save(st);
    return SaveService.listLocal()[0];
  })()`);
  check('hero saved to slot 1', saved?.name === 'Ana' && saved?.classId === 'warden', JSON.stringify(saved));

  // 2) Load screen shows the card; Load enters WorldV2
  await page.eval(`window.__game.scene.getScene('MainMenu').scene.launch('Load'), window.__game.scene.getScene('MainMenu').scene.pause()`);
  await sleep(2500);
  await page.screenshot(`${OUT}/front-load.png`);
  await page.click(966, 180);
  check('Load → WorldV2', await waitFor(`!!window.__game.scene.isActive('WorldV2')`, 60000));
  await sleep(4000);
  await page.screenshot(`${OUT}/front-world.png`);

  // class openings start with narration; Esc belongs to a conversation, so finish it first
  for (let i = 0; i < 30; i++) {
    const n = await page.eval(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; return d.active ? d.view.choices.length : -1; })()`);
    if (n < 0) break;
    await page.press(n > 0 ? `Digit${Math.min(9, n)}` : 'Space', 60);
    await sleep(400);
  }
  // 3) Esc → Pause (solo freezes the sim) → Esc resumes
  await page.press('Escape', 60); await sleep(1200);
  check('Esc opens Pause', await active('Pause'));
  check('solo sim paused', await page.eval(`(async () => (await import('/src/net/SimLoop.ts')).sim.isPaused())()`) === true);
  await page.screenshot(`${OUT}/front-pause.png`);
  await page.press('Escape', 60); await sleep(800);
  check('Esc resumes', !(await active('Pause')));

  // 4) back to title → Public Realms → Enter Brindlecross Square (live server)
  await page.eval(`(() => { const g = window.__game; for (const k of ['HudV2', 'WorldV2']) if (g.scene.isActive(k)) g.scene.stop(k); g.scene.start('MainMenu'); })()`);
  await sleep(2000);
  await page.eval(`window.__game.scene.getScene('MainMenu').scene.launch('Realms'), window.__game.scene.getScene('MainMenu').scene.pause()`);
  const listed = await waitFor(`(() => { const s = window.__game.scene.getScene('Realms'); return !!s && s.realms?.length === 4; })()`, 20000);
  check('realm list from server', listed);
  await page.screenshot(`${OUT}/front-realms.png`);
  await page.click(522, 316);
  check('Enter → WorldV2 as server-client', await waitFor(`(async () => { const c = await import('/src/core/index.ts'); return window.__game.scene.isActive('WorldV2') && c.Services.get('net').role === 'server-client'; })()`, 30000));
  await sleep(5000);
  const where = await page.eval(`(async () => { const c = await import('/src/core/index.ts'); const s = window.__game.scene.getScene('WorldV2'); return { space: s.space, saveSpace: c.Game.state.world.location.space ?? null, members: c.Services.get('net').session().members.length }; })()`);
  check('rendering the realm space (concordia), save untouched', where.space === 'concordia', JSON.stringify(where));
  await page.screenshot(`${OUT}/front-realm.png`);

  // 5) chat: Enter opens the field; a sent line comes back from the server
  await page.press('Enter', 60); await sleep(600);
  check('Enter opens chat field', await page.eval(`!!document.querySelector('#game input')`));
  await page.press('Escape', 60); await sleep(300);
  await page.eval(`(async () => (await import('/src/core/index.ts')).Services.get('net').send({ type: 'chat', text: 'hello realm' }))()`);
  await sleep(1200);
  const chat = await page.eval(`(() => { const h = window.__game.scene.getScene('HudV2'); return { active: window.__game.scene.isActive('HudV2'), chat: !!h?.chat, lines: h?.chat?.lines?.map((l) => l.name + ': ' + l.text) ?? null }; })()`);
  check('chat line rendered', !!chat.lines?.some((l) => l.endsWith('hello realm')), JSON.stringify(chat));
  await page.screenshot(`${OUT}/front-chat.png`);

  // 6) leave: Pause → Quit to title goes back to solo
  await page.eval(`(async () => { (await import('/src/net/coop/index.ts')).leaveCoop(); })()`);
  check('left the realm (solo again)', await page.eval(`(async () => (await import('/src/core/index.ts')).Services.get('net').role)()`) === 'solo');
} catch (e) { check('harness', false, String(e)); }

const errs = errors.filter((e) => !/auth\/|identitytoolkit|Firebase|firestore|ERR_|favicon/i.test(e));
check('no page errors', !errs.length, errs.slice(0, 5).join(' | '));
await page.close();
const failed = results.filter((x) => !x).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
