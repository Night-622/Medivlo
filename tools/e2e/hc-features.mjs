// Systems features in the real browser with REAL input (Claude 3, pre-deploy gate). Per class (default warden,
// arcanist, jester): click a creature at the edge of its sprite → targeted, just outside → not; keys 1–3 cast;
// standing in a creature's telegraph costs HP and walking out of it with real WASD does not; spend a skill point by
// clicking in Skills and equip an item by clicking in the Pack, and read the change on screen. Once: every 5-tab bar
// tab and ✕ clicked at its centre and in its bottom-right quarter; a boss-bar screenshot.
//   npx vite --config tools/e2e/vite.test.config.mjs ; node tools/e2e/hc-features.mjs [--base http://localhost:5199] [--class a,b] [--out dir]
// Failing lines start with "FAIL"; the last line is "N/M passed"; exit code 1 on any failure.
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5199'), OUT = arg('out', 'tools/e2e/out');
const CLASSES = arg('class', 'warden,arcanist,jester').split(',');
const SCHOOL = { warden: 'rime', arcanist: 'ash', jester: 'guile', reaver: 'ash', falconer: 'hunt', knight: 'iron', bard: 'song' };
mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ` :: ${String(detail).slice(0, 220)}` : ''}`); if (ok) pass++; else fail++; return ok; };
const page = await launch({ port: 9400 + Math.floor(Math.random() * 300) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const ev = (expr) => page.eval(expr);
const waitFor = async (expr, ms = 60000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (await ev(expr)) return true; } catch { /* loading */ } await sleep(300); } return false; };
const hudTexts = () => ev(`(() => { const out = []; const walk = (o) => { if (!o) return; if (o.type === 'Text' && o.visible) out.push(o.text); (o.list || []).forEach(walk); }; window.__game.scene.getScene('HudV2').children.list.forEach(walk); return out; })()`);
const statOnScreen = async (label) => { const t = await hudTexts(); const i = t.indexOf(label); return i >= 0 ? parseFloat(String(t[i + 1]).replace(/[^\d.]/g, '')) : NaN; };
const uiLog = () => ev('window.__ui || []');
const clearUi = () => ev('(window.__ui = [], 1)');
const endDialogue = async () => {
  for (let i = 0; i < 40; i++) {
    const n = await ev(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; return d.active ? d.view.choices.length : -1; })()`);
    if (n < 0) return;
    await page.press(n > 0 ? 'Digit1' : 'Space', 60); await sleep(300);
  }
};

async function enter(cls) {
  await page.goto(`${BASE}/?scene=WorldV2&space=realm:${SCHOOL[cls] ?? 'ash'}&hc_class=${cls}`);
  if (!(await waitFor('!!(window.__hc && window.__hc.local())', 90000))) throw new Error('hero never appeared');
  await sleep(2500);
  await endDialogue();
  await ev(`(async () => { const c = await import('/src/core/index.ts'); window.__ui = []; window.__casts = []; window.__teles = [];
    c.bus.on('ui:open', (e) => window.__ui.push('open:' + e.panel)); c.bus.on('ui:close', (e) => window.__ui.push('close:' + e.panel));
    c.bus.on('ability:cast', (e) => window.__casts.push(e)); c.bus.on('enemy:telegraph', (e) => window.__teles.push(e)); return 1; })()`);
  // clear the waystone's surroundings so nothing else joins in
  await ev(`(async () => { const c = await import('/src/core/index.ts'); for (const e of window.__hc.enemies()) c.Services.get('combat').despawn(e.id); return 1; })()`);
}

async function targeting(cls) {
  const [id] = await ev(`window.__hc.spawn('bx_wolf', 1, 1, 150)`);
  await ev(`window.__hc.freeze(${JSON.stringify(id)})`); // it must not walk between reading its bounds and the click
  await sleep(800);
  const b = await ev(`window.__hc.bounds(${JSON.stringify(id)})`);
  if (!check(!!b && b.w > 4, `${cls}: the spawned creature has a sprite on screen`, JSON.stringify(b))) return;
  const cy = Math.round(b.y + b.h * 0.6), cx = b.x + b.w / 2;
  // the click reaches the sim on a later tick (headless frames are slow): poll rather than sleep a fixed time
  const want = JSON.stringify(id);
  await page.click(Math.round(cx + b.w * 0.4), cy);
  await waitFor(`window.__hc.local().target === ${want}`, 2500);
  const inside = await ev('window.__hc.local().target');
  await page.click(Math.round(cx + b.w / 2 + 48), cy);
  await waitFor(`window.__hc.local().target !== ${want}`, 2500);
  const outside = await ev('window.__hc.local().target');
  check(inside === id, `${cls}: clicking near the edge of a creature's sprite targets it`, `target ${inside}, want ${id}`);
  check(outside !== id, `${cls}: clicking just outside its sprite does not`, `target ${outside}`);
  // keys 1–3 cast with real key presses (the target is in front of us)
  await page.click(Math.round(cx), cy); await sleep(300);
  for (const [i, key] of ['Digit1', 'Digit2', 'Digit3'].entries()) {
    await ev('(window.__casts = [], window.__hc.heal(), 1)');
    await page.press(key, 70); await sleep(900);
    const casts = await ev(`(async () => { const c = await import('/src/core/index.ts'); const me = 'p:' + c.Services.get('net').localPlayer; const hot = window.__hc.character().hotbar; return { got: window.__casts.filter((e) => e.casterId === me).map((e) => e.ability), want: hot[${i}] }; })()`);
    check(!!casts.want && casts.got.includes(casts.want), `${cls}: key ${i + 1} casts ${casts.want}`, JSON.stringify(casts.got));
    await sleep(400);
  }
  await ev(`(async () => { const c = await import('/src/core/index.ts'); c.Services.get('combat').despawn(${JSON.stringify(id)}); return 1; })()`);
}

async function telegraphs(cls) {
  // a creature rigged to one telegraphed ground strike at the hero (no basic attacks, never moves)
  const run = async (walkOut) => {
    await ev('(window.__hc.heal(), window.__teles = [], 1)');
    const [id] = await ev(`window.__hc.spawn('bx_storm_1', 1, 1, 160)`);
    const rigged = await ev(`window.__hc.rig(${JSON.stringify(id)}, 'bolts')`);
    if (!rigged) return { rigged, tele: false };
    const tele = await waitFor(`(window.__teles || []).some((t) => t.id === ${JSON.stringify(id)})`, 12000);
    const t = (await ev('window.__teles'))[0];
    const hp0 = (await ev('window.__hc.local()')).hp;
    if (walkOut) await page.hold(['KeyS'], 900);
    await sleep((t?.ms ?? 300) + 700);
    const hp1 = (await ev('window.__hc.local()')).hp;
    await ev(`(async () => { const c = await import('/src/core/index.ts'); c.Services.get('combat').despawn(${JSON.stringify(id)}); return 1; })()`);
    return { rigged, tele, lost: Math.round(hp0 - hp1), r: t?.r };
  };
  const stay = await run(false);
  check(stay.rigged && stay.tele && stay.lost > 0, `${cls}: standing in a telegraph costs HP`, JSON.stringify(stay));
  await sleep(800);
  const out = await run(true);
  check(out.rigged && out.tele && out.lost === 0, `${cls}: walking out of the telegraph (real S key) costs nothing`, JSON.stringify(out));
}

async function skillsAndPack(cls) {
  // one skill point to spend; a helm to wear
  await ev(`(async () => { const ch = await import('/src/systems/client/character.ts'); ch.character().bonusPoints += 1; ch.sendLoadout(); ch.changed(); window.__hc.give('a_${SCHOOL[cls] ?? 'ash'}_plate_helm', 1); return 1; })()`);
  await sleep(600);
  await page.press('KeyI', 70); await sleep(1000);
  const hp0 = await statOnScreen('Max health'), ar0 = await statOnScreen('Armour');
  await page.press('KeyK', 70); await sleep(900);
  // Toughness (skills branch, bottom of the middle path): click to read it, click again to learn
  await page.click(468, 548); await sleep(250); await page.click(468, 548); await sleep(700);
  await page.press('KeyI', 70); await sleep(900);
  const hp1 = await statOnScreen('Max health');
  check(hp1 > hp0, `${cls}: a point spent by clicking in Skills raises Max health on the Pack screen`, `${hp0} → ${hp1}`);
  // click the helm where the Pack grid draws it (11 columns of 64 px from (532, 184), in inventory order)
  const idx = await ev(`window.__hc.character().inventory.findIndex((x) => x.base === 'a_${SCHOOL[cls] ?? 'ash'}_plate_helm')`);
  if (!check(idx >= 0, `${cls}: the helm is in the pack`, `index ${idx}`)) return;
  await page.click(532 + (idx % 11) * 64, 184 + Math.floor(idx / 11) * 64); await sleep(900);
  const ar1 = await statOnScreen('Armour');
  check(ar1 > ar0, `${cls}: clicking a helm in the Pack equips it and Armour goes up on screen`, `${ar0} → ${ar1}`);
  await page.screenshot(`${OUT}/hcf-${cls}-pack.png`);
  await page.press('Escape', 70); await sleep(600);
}

async function tabs() {
  // 5-tab bar: centre and bottom-right quarter of every tab, then the ✕ (the hit area used to cover one quarter only)
  const W = 150, H = 44, GAP = 8, x0 = 640 - (5 * W + 4 * GAP) / 2;
  const names = ['inventory', 'skills', 'spells', 'journal', 'map'];
  for (const [label, fx, fy] of [['centre', 0.5, 0.5], ['bottom-right', 0.85, 0.85]]) {
    for (const [i, target] of names.entries()) {
      // start from another panel (Skills for the Pack tab, the Pack for the rest), then click the tab
      await page.press(target === 'inventory' ? 'KeyK' : 'KeyI', 70); await sleep(800);
      await clearUi();
      await page.click(Math.round(x0 + i * (W + GAP) + W * fx), Math.round(20 + H * fy)); await sleep(800);
      const log = await uiLog();
      check(log.includes(`open:${target}`), `tab bar: clicking ${target} at its ${label} switches to it`, JSON.stringify(log));
      await page.press('Escape', 70); await sleep(600);
      if (await ev(`window.__game.scene.isActive('Pause')`)) { await page.press('Escape', 70); await sleep(500); }
    }
    await page.press('KeyI', 70); await sleep(700); await clearUi();
    await page.click(Math.round(1188 + 44 * fx), Math.round(20 + 44 * fy)); await sleep(700);
    check((await uiLog()).includes('close:inventory'), `tab bar ✕ at its ${label} closes the panel`, JSON.stringify(await uiLog()));
  }
}

async function bossBar(cls) {
  await ev(`window.__hc.spawn('bx_${SCHOOL[cls] ?? 'ash'}_5', 1, 1, 260)`); await sleep(1500);
  await page.screenshot(`${OUT}/hcf-boss-bar.png`);
  const frame = await ev(`(() => { const s = window.__game.scene.getScene('HudV2'); let best = null; const walk = (o) => { if (!o) return; if (o.type === 'Container' && o.visible && o.list?.some((x) => x.type === 'Text' && /Tyrant|Pyrelord|Vulkan|boss/i.test(x.text || ''))) best = o; (o.list || []).forEach(walk); }; s.children.list.forEach(walk); if (!best) return null; const b = best.getBounds(); return { x: Math.round(b.x), r: Math.round(b.right) }; })()`);
  check(!frame || (frame.x >= 380 && frame.r <= 900), 'boss bar sits clear of the unit frame and the minimap (x 386–894)', JSON.stringify(frame));
}

try {
  for (const [k, cls] of CLASSES.entries()) {
    await enter(cls);
    await targeting(cls);
    await telegraphs(cls);
    await skillsAndPack(cls);
    if (k === 0) { await tabs(); await bossBar(cls); }
  }
} catch (e) { check(false, 'harness', e.message); }
check(!errors.length, 'no page errors', errors.slice(0, 5).join(' | '));
await page.close();
console.log(`${pass}/${pass + fail} passed`);
if (fail) process.exitCode = 1;
