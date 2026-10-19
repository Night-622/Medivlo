// Character panel flow (Claude 3): I opens Pack, tabs switch, Esc closes without opening Pause, the Journal tab
// hands over with ui:open journal, the sim pauses only while a panel is open. Real keyboard and mouse.
//   node tools/e2e/hc-panels.mjs [--base http://localhost:5198] [--out tools/e2e/out]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5198'), OUT = arg('out', 'tools/e2e/out');
mkdirSync(OUT, { recursive: true });
let fails = 0;
const check = (ok, what) => { console.log(ok ? 'ok  ' : 'FAIL', what); if (!ok) fails++; };

const page = await launch();
try {
  await page.goto(`${BASE}/?scene=WorldV2&space=realm:rime&hc_class=warden`);
  for (let i = 0; i < 240; i++) { if (await page.eval('!!(window.__hc && window.__hc.local())')) break; await sleep(500); }
  await sleep(1500);
  // record ui events and the pause state from inside the page
  await page.eval(`(async () => { const c = await import('/src/core/index.ts'); window.__ui = []; for (const n of ['ui:open', 'ui:close']) c.bus.on(n, (e) => window.__ui.push(n + ':' + e.panel)); })()`);
  const paused = () => page.eval(`(async () => (await import('/src/net/SimLoop.ts')).sim.isPaused())()`);
  const ui = () => page.eval('window.__ui.splice(0)');

  await page.press('KeyI', 60); await sleep(700);
  check((await ui()).includes('ui:open:inventory'), 'I opens the Pack (ui:open inventory)');
  check(await paused(), 'the solo sim pauses while the Pack is open');
  await page.screenshot(`${OUT}/panels-pack.png`);

  await page.press('KeyK', 60); await sleep(600);
  const k = await ui();
  check(k.includes('ui:open:skills') && !k.includes('ui:close:inventory'), `K switches to Skills in place (${k.join(', ')})`);
  await page.screenshot(`${OUT}/panels-skills.png`);

  await page.press('Escape', 60); await sleep(700);
  const esc = await ui();
  check(esc.includes('ui:close:skills'), `Esc closes the panel (${esc.join(', ')})`);
  check(!esc.includes('ui:open:pause'), 'Esc does not open Pause while a panel is open');
  check(!(await paused()), 'the sim resumes after closing');

  await page.press('KeyB', 60); await sleep(700);
  await ui();
  // Journal tab: 4th of 5 tabs, 150 wide + 8 gap, centred, y 20..64
  const x0 = 640 - (5 * 150 + 4 * 8) / 2;
  await page.click(Math.round(x0 + 3 * 158 + 75), 42); await sleep(700);
  const j = await ui();
  check(j.includes('ui:close:spells') && j.includes('ui:open:journal'), `Journal tab hands over (${j.join(', ')})`);
  await page.screenshot(`${OUT}/panels-journal.png`);
  await page.press('Escape', 60); await sleep(700);

  // Runeforge at Odo's anvil: reforge a worn sword to the hero's level, then set a ruby in it (real clicks)
  await page.eval(`(async () => {
    const ch = (await import('/src/systems/client/character.ts')).character();
    ch.level = 10; ch.gold = 5000;
    ch.inventory.push({ uid: 'e2e-ing', base: 'i_ingot', ilvl: 1, qty: 10 }, { uid: 'e2e-rb', base: 'i_ruby', ilvl: 1, qty: 1 });
    ch.equipment.main = { uid: 'e2e-w', base: 'w_sword_rime', ilvl: 1, qty: 1 };
    (await import('/src/core/flags.ts')).setFlag('shop.open', 'npc:odo');
  })()`);
  await sleep(900);
  check((await ui()).includes('ui:open:shop'), 'shop.open = npc:odo opens the Anvil');
  await page.click(236 + 75, 96 + 22); await sleep(500); // Runeforge tab
  const worn = await page.eval(`(async () => Object.values((await import('/src/systems/client/character.ts')).character().equipment).findIndex((x) => x && x.uid === 'e2e-w'))()`);
  await page.click(76 + (worn % 8) * 64 + 28, 184 + Math.floor(worn / 8) * 64 + 28); await sleep(500);
  await page.screenshot(`${OUT}/panels-runeforge.png`);
  await page.click(226, 404); await sleep(700); // Reforge
  const sword = () => page.eval(`(async () => JSON.stringify((await import('/src/systems/client/character.ts')).character().equipment.main))()`);
  check(JSON.parse(await sword()).ilvl === 10, `Reforge raises the sword to level 10 (${await sword()})`);
  await page.click(76 + 28, 480 + 28); await sleep(700); // first gem cell
  check(JSON.parse(await sword()).gem === 'i_ruby', `clicking the ruby sets it (${await sword()})`);
  await page.screenshot(`${OUT}/panels-runeforge-done.png`);
  await page.press('Escape', 60); await sleep(600);
  check((await ui()).includes('ui:close:shop'), 'Esc closes the Anvil');
} catch (e) {
  check(false, `harness: ${e.message}`);
} finally {
  await page.close();
}
console.log(fails ? `FAIL ${fails}` : 'OK');
process.exit(fails ? 1 : 0);
