// QA (Claude 7, for Claude 6's accessibility pass): every screen usable with the keyboard alone, and Large text clean.
//  1. keyboard only: on each screen, every clickable control is also a keyboard stop (KeyNav `nav` items, the title's
//     ↑/↓ menu, Pause's ↑/↓ list), the gold focus ring appears on the first arrow and moves, Enter presses, Esc closes.
//     Settings is driven entirely by keys: Accessibility tab → Text size → Large (that sets up part 2).
//  2. Large text: every screen and HUD panel is toured at Normal and at Large size; any texts that overlap (by more
//     than a third of the smaller) or leave the screen at Large but not at Normal are reported per screen.
// Mouse-only controls are listed by their label. Character creation's Look/Outfit options are a known gap (skipped).
//   node tools/e2e/qa-a11y.mjs [--base http://localhost:5172] [--out tools/e2e/out/qa]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5172'), OUT = arg('out', 'tools/e2e/out/qa');
mkdirSync(OUT, { recursive: true });
let fails = 0, total = 0;
const check = (what, ok, detail = '') => { total++; if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'} ${what}${detail ? ` :: ${String(detail).slice(0, 300)}` : ''}`); return ok; };
const page = await launch({ port: 9050 + Math.floor(Math.random() * 50) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const ev = (e) => page.eval(e);
const waitFor = async (expr, ms = 30000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (await ev(expr)) return true; } catch { /* loading */ } await sleep(250); } return false; };
const active = (k) => ev(`!!window.__game?.scene.isActive(${JSON.stringify(k)})`);

// in-page: a screen's visible texts, its clickable controls (labelled) and its keyboard stops
await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `
window.__a11y = (key) => {
  const g = window.__game, s = g && g.scene.getScene(key); if (!s || !s.sys.isActive()) return null;
  const W = g.scale.width, H = g.scale.height, texts = [], hits = [];
  const vis = (o) => { for (let x = o; x; x = x.parentContainer) { if (x.visible === false || x.alpha === 0) return false; } return true; };
  const walk = (list) => { for (const o of list) { if (o.type === 'Container') { walk(o.list); continue; }
    if (!vis(o)) continue; const b = o.getBounds ? o.getBounds() : null; if (!b) continue;
    if (o.type === 'Text' && o.text && o.text.trim()) texts.push({ t: o.text.replace(/\\s+/g, ' ').slice(0, 40), b: { x: b.x, y: b.y, w: b.width, h: b.height } });
    if (o.input && o.input.enabled && b.width > 6 && b.height > 6 && b.width * b.height < W * H * 0.8) hits.push({ o, b }); } };
  walk(s.children.list);
  const labelOf = (o, b) => { if (o.type === 'Text') return o.text.replace(/\\s+/g, ' ').slice(0, 30);
    const t = texts.find((x) => x.b.x + x.b.w / 2 > b.x && x.b.x + x.b.w / 2 < b.x + b.width && x.b.y + x.b.h / 2 > b.y && x.b.y + x.b.h / 2 < b.y + b.height);
    return t ? t.t.slice(0, 30) : o.type + '@' + Math.round(b.x) + ',' + Math.round(b.y); };
  const navObjs = new Set((s.nav && s.nav.items || []).map((x) => x.obj));
  const keyed = (s.items || []).map((x) => x.bg || x.label).filter(Boolean); // MainMenu / Pause ↑↓ lists
  for (const k of keyed) navObjs.add(k);
  const navLabels = new Set([...navObjs].map((o) => { const b = o.getBounds(); return labelOf(o, b); }));
  const mouseOnly = hits.filter((h) => !navObjs.has(h.o) && !navLabels.has(labelOf(h.o, h.b))).map((h) => labelOf(h.o, h.b));
  return { texts, mouseOnly: [...new Set(mouseOnly)], stops: navObjs.size, nav: s.nav ? { i: s.nav.i, focused: s.nav.focused } : null, sel: s.sel ?? null };
};` });
const shot = (n) => page.screenshot(`${OUT}/a11y-${n}.png`);
const layouts = { normal: {}, large: {} };
const record = async (size, name, key) => { const r = await ev(`window.__a11y(${JSON.stringify(key)})`); if (r) layouts[size][name] = r.texts; return r; };
// ✕ close buttons are covered by Esc (every screen here closes on Esc: checked separately); HUD controls by `hudBase`
let hudBase = new Set();
const keyOnly = (name, r, allow = []) => { if (!r) return; const left = r.mouseOnly.filter((l) => l !== '✕' && !hudBase.has(l) && !allow.some((a) => l.includes(a)));
  check(`${name}: every clickable control is also a keyboard stop`, left.length === 0, `mouse-only: ${left.join(' | ')}`); };
const ringMoves = async (name, key, presses = 3) => {
  await page.press('ArrowDown'); await sleep(250);
  const a = await ev(`window.__a11y(${JSON.stringify(key)})`);
  for (let i = 0; i < presses; i++) { await page.press('Tab'); await sleep(150); }
  const b = await ev(`window.__a11y(${JSON.stringify(key)})`);
  check(`${name}: the first arrow shows the focus ring and Tab moves it`, !!a?.nav?.focused && b?.nav?.i !== a?.nav?.i, JSON.stringify({ first: a?.nav, after: b?.nav, stops: a?.stops }));
};

async function tour(size) {
  // ── title ──
  await page.goto(`${BASE}/`);
  await waitFor(`!!window.__game?.scene.isActive('MainMenu')`, 120000); await sleep(1500);
  const t = await record(size, 'title', 'MainMenu');
  if (size === 'normal') {
    const seen = new Set(); for (let i = 0; i < 9; i++) { seen.add(await ev(`(() => { const s = window.__game.scene.getScene('MainMenu'); return s.items[s.sel].label.text; })()`)); await page.press('ArrowDown'); await sleep(120); }
    const enabled = await ev(`window.__game.scene.getScene('MainMenu').items.filter((x) => x.enabled).length`);
    check('title: ↑/↓ reaches every enabled menu item', seen.size >= enabled, `${[...seen].join(', ')} (${enabled} enabled)`);
    keyOnly('title', t);
    await shot('title');
  }
  // ── Settings by keys only: move the title selection to Settings, Enter ──
  for (let i = 0; i < 12 && (await ev(`(() => { const s = window.__game.scene.getScene('MainMenu'); return s.items[s.sel].label.text; })()`)) !== 'Settings'; i++) { await page.press('ArrowDown'); await sleep(100); }
  await page.press('Enter'); await sleep(900);
  if (size === 'normal' && check('title: Enter on Settings opens it (keyboard)', await active('Settings'))) {
    keyOnly('Settings › Video', await record(size, 'settings-video', 'Settings'));
    await ringMoves('Settings', 'Settings');
    // walk the stops until the Accessibility tab is focused, Enter; then to the "Large" option, Enter
    const pressLabel = async (want, max = 80) => { for (let i = 0; i < max; i++) { const lab = await ev(`(() => { const s = window.__game.scene.getScene('Settings'); const l = s.nav.items.filter((x) => x.obj.scene && x.obj.visible !== false); const o = l[Math.min(s.nav.i, l.length - 1)]?.obj; if (!o) return ''; const b = o.getBounds(); const r = window.__a11y('Settings'); const t = r.texts.find((x) => x.b.x + x.b.w / 2 > b.x && x.b.x + x.b.w / 2 < b.x + b.width && x.b.y + x.b.h / 2 > b.y && x.b.y + x.b.h / 2 < b.y + b.height); return t ? t.t : ''; })()`); if (lab === want) { await page.press('Enter'); await sleep(500); return true; } await page.press('Tab'); await sleep(60); } return false; };
    check('Settings: Tab reaches the Accessibility tab and Enter opens it', await pressLabel('Accessibility') && (await ev(`window.__game.scene.getScene('Settings').tab`)) === 'accessibility');
    keyOnly('Settings › Accessibility', await record(size, 'settings-access', 'Settings'));
    check('Settings: Tab reaches Text size › Large and Enter sets it', await pressLabel('Large') && (await ev(`JSON.parse(localStorage.getItem('hollowcrown.settings')).textSize`)) === 'large');
    await shot('settings-keyboard');
    for (const tab of ['controls', 'gameplay', 'audio']) { await ev(`(() => { const s = window.__game.scene.getScene('Settings'); s.tab = ${JSON.stringify(tab)}; s.render(); return 1; })()`); await sleep(400); keyOnly(`Settings › ${tab}`, await record(size, 'settings-' + tab, 'Settings'), ['Rebind']); }
    await page.press('Escape'); await sleep(700);
    check('Settings: Esc closes it back to the title', !(await active('Settings')) && (await active('MainMenu')));
  } else if (size === 'large') {
    for (const tab of ['video', 'audio', 'controls', 'gameplay', 'accessibility']) { await ev(`(() => { const s = window.__game.scene.getScene('Settings'); s.tab = ${JSON.stringify(tab)}; s.render(); return 1; })()`); await sleep(400); await record(size, 'settings-' + tab, 'Settings'); }
    await page.press('Escape'); await sleep(700);
  }
  // ── other title screens (opened directly; keyboard stops checked, Esc closes) ──
  for (const [name, key] of [['Load', 'Load'], ['Realms', 'Realms'], ['Credits', 'Credits'], ['Account', 'Account'], ['Friends', 'Friends']]) {
    await ev(`(() => { const m = window.__game.scene.getScene('MainMenu'); m.scene.launch(${JSON.stringify(key)}, { from: 'MainMenu' }); m.scene.pause(); return 1; })()`); await sleep(1200);
    const r = await record(size, name.toLowerCase(), key);
    if (size === 'normal' && r) { keyOnly(name, r); await shot(name.toLowerCase()); }
    await page.press('Escape'); await sleep(700);
    if (size === 'normal') check(`${name}: Esc closes it`, !(await active(key)), '');
    if (await active(key)) await ev(`(() => { window.__game.scene.stop(${JSON.stringify(key)}); window.__game.scene.resume('MainMenu'); return 1; })()`);
  }
  // ── in the world: HUD, Pause, People, Pack / Skills / Spells, Journal, Map, Death ──
  await ev(`(async () => { const core = await import('/src/core/index.ts'); const { defaultLook } = await import('/src/data/classes/hc/index.ts');
    const st = core.createNewGameState(0); st.player.name = 'Ash'; st.player.hero = { classId: 'warden', look: defaultLook('warden', 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
    core.Game.set(st); window.__game.scene.getScene('MainMenu').scene.start('WorldV2'); return 1; })()`);
  await waitFor('!!(window.__hc && window.__hc.local() && window.__hud)', 120000); await sleep(2500);
  for (let i = 0; i < 30; i++) { const a = await ev(`(async () => (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient.active)()`); if (!a) break; await page.press('Space'); await sleep(300); }
  const hudR = await record(size, 'hud', 'HudV2');
  if (hudR) hudBase = new Set(hudR.mouseOnly); // the HUD's own buttons answer to their keys (I/K/B/J/M, 1–4, Q/E)
  await page.press('Escape'); await sleep(800);
  const pause = await record(size, 'pause', 'Pause');
  if (size === 'normal' && pause) { keyOnly('Pause', pause); const s0 = pause.sel; await page.press('ArrowDown'); await sleep(200); check('Pause: ↓ moves the selection', (await ev(`window.__game.scene.getScene('Pause').sel`)) !== s0); }
  await page.press('Escape'); await sleep(600);
  for (const [name, k] of [['People', 'KeyP'], ['Pack', 'KeyI'], ['Skills', 'KeyK'], ['Spells', 'KeyB'], ['Journal', 'KeyJ'], ['Map', 'KeyM']]) {
    await page.press(k); await sleep(1000);
    const sc = name === 'People' ? 'People' : name === 'Journal' ? 'NarrativeUi' : 'HudV2';
    const r = await record(size, name.toLowerCase(), sc);
    if (size === 'normal' && r && name === 'People') {
      // People's cards move with the arrow keys (not KeyNav); only the filter tabs must be Tab stops
      const tabs = ['Everyone', 'Story', 'Trade', 'Villagers'];
      check('People: the filter tabs are keyboard stops', !r.mouseOnly.some((l) => tabs.includes(l)), `mouse-only: ${r.mouseOnly.join(' | ')}`);
      const s0 = await ev(`window.__game.scene.getScene('People').sel`); await page.press('ArrowRight'); await sleep(250);
      check('People: → moves to the next person', (await ev(`window.__game.scene.getScene('People').sel`)) !== s0);
    } else if (size === 'normal' && r && name !== 'Map' && name !== 'Journal') keyOnly(name, r);
    await shot(`${size}-${name.toLowerCase()}`);
    await page.press('Escape'); await sleep(600);
    if (await active('Pause')) { await page.press('Escape'); await sleep(400); }
  }
  // the smith's shop (Trade) and its Runeforge: opened the way dialogue opens it (flag shop.open = the merchant)
  await ev(`(async () => { (await import('/src/core/flags.ts')).setFlag('shop.open', 'npc:rime-smith'); return 1; })()`); await sleep(1200);
  const trade = await record(size, 'shop-trade', 'HudV2');
  if (size === 'normal' && trade) {
    keyOnly('Shop › Trade', trade);
    for (let i = 0; i < 60; i++) { const lab = await ev(`(() => { const s = window.__game.scene.getScene('HudV2'); const l = (s.nav?.items || []).filter((x) => x.obj.scene && x.obj.visible !== false); const o = l[Math.min(s.nav?.i ?? -1, l.length - 1)]?.obj; if (!o) return ''; const b = o.getBounds(); const t = window.__a11y('HudV2').texts.find((x) => x.b.x + x.b.w / 2 > b.x && x.b.x + x.b.w / 2 < b.x + b.width && x.b.y + x.b.h / 2 > b.y && x.b.y + x.b.h / 2 < b.y + b.height); return t ? t.t : ''; })()`); if (lab === 'Runeforge') { await page.press('Enter'); await sleep(800); break; } await page.press('Tab'); await sleep(60); }
    const forge = await record(size, 'shop-runeforge', 'HudV2');
    check('Shop: Tab reaches the Runeforge tab and Enter opens it', !!forge && forge.texts.some((t) => /Reforge|Upgrade|Salvage/.test(t.t)));
    if (forge) keyOnly('Shop › Runeforge', forge);
    await shot('shop-runeforge');
  } else await record(size, 'shop-runeforge', 'HudV2');
  await page.press('Escape'); await sleep(600);
  if (await active('Pause')) { await page.press('Escape'); await sleep(400); }
  // Death: Enter respawns (autofocus on Return)
  // creatures don't engage in a safe zone (the start waystone): step out into the wilds first
  for (let i = 0; i < 8 && (await ev('window.__world.where().rule')) === 'safe'; i++) { const w0 = await ev('window.__world.where()'); await ev(`window.__world.tp(${w0.tx + 12 * (i % 2 ? -1 : 1)}, ${w0.ty + 10 * (i + 1)})`); await sleep(800); }
  await ev(`window.__hc.spawn('bx_rime_5', 2, undefined, 60)`);
  await waitFor(`window.__game.scene.isActive('Death')`, 90000); await sleep(1500);
  const death = await record(size, 'death', 'Death');
  if (size === 'normal' && death) {
    keyOnly('Death', death);
    check('Death: Return is focused at once (autofocus)', !!death.nav?.focused, JSON.stringify(death.nav));
    await ev(`(async () => { const c = await import('/src/core/index.ts'); const p = window.__hc.local(); for (const e of window.__hc.enemies()) if (Math.hypot(e.x - p.x, e.y - p.y) < 600) c.Services.get('combat').despawn(e.id); return 1; })()`);
    await page.press('Enter'); await sleep(2000);
    check('Death: Enter respawns', !(await active('Death')));
  }
}

const overlaps = (texts) => { const out = []; const W = 1280, H = 720;
  for (const a of texts) if (a.b.x < -2 || a.b.y < -2 || a.b.x + a.b.w > W + 2 || a.b.y + a.b.h > H + 2) out.push(`"${a.t}" off screen`);
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) { const a = texts[i].b, b = texts[j].b;
    if (texts[i].t === texts[j].t) continue; // a text and its shadow copy
    const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)), iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    if (ix * iy > Math.min(a.w * a.h, b.w * b.h) / 3) out.push(`"${texts[i].t}" × "${texts[j].t}"`); }
  return out; };

try {
  await page.goto(`${BASE}/`); await waitFor(`!!window.__game?.scene.isActive('MainMenu')`, 120000);
  await ev(`(localStorage.removeItem('hollowcrown.settings'), 1)`);
  await tour('normal');
  // part 2: Large text was set by keyboard in part 1 and persists; reload so every screen and the HUD are rebuilt at Large
  if ((await ev(`(JSON.parse(localStorage.getItem('hollowcrown.settings') || '{}').textSize)`)) !== 'large') await ev(`(async () => (await import('/src/core/index.ts')).Settings.set('textSize', 'large'), 1)()`);
  await tour('large');
  for (const name of Object.keys(layouts.large)) {
    const before = new Set(overlaps(layouts.normal[name] ?? [])), now = overlaps(layouts.large[name]).filter((x) => !before.has(x));
    check(`Large text: ${name} has no new overlap or off-screen text`, now.length === 0, now.slice(0, 4).join(' | '));
  }
} catch (e) { check('harness', false, String(e?.stack ?? e).split('\n').slice(0, 2).join(' < ')); }
const errs = errors.filter((e) => !/auth\/|firestore|Firebase/i.test(e));
check('no console errors', !errs.length, errs.slice(0, 4).join(' | '));
await page.send('Runtime.evaluate', { expression: `localStorage.removeItem('hollowcrown.settings')` });
await page.close();
console.log(`\n${total - fails}/${total} passed`);
process.exit(fails ? 1 : 0);
