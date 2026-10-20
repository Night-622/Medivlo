// HUD behaviour test (Claude 1): real keyboard and mouse in WorldV2, reading what the HUD shows through the DEV
// probe window.__hud (src/ui/hud/hudProbe.ts). Part of the pre-deploy check (tools/release/predeploy-check.mjs).
// Checks: frame matches the hero (name, level, HP text and bar), layout (inside the screen, no overlaps, centre
// kept clear), menu buttons (bound keys, click opens, Esc closes without pausing), rebinding updates the buttons and
// the key, combat moves the HP / Ember / XP bars, minimap + hotbar present, boss bar on a boss, toast, banner,
// fade under full-screen panels, Esc → Pause, death → Death screen, no console errors.
//   node tools/e2e/hud.mjs [--base http://localhost:5199] [--out tools/e2e/out] [--class warden]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5199'), OUT = arg('out', 'tools/e2e/out'), CLS = arg('class', 'warden');
const SCHOOL = { warden: 'rime', arcanist: 'ash', falconer: 'hunt', jester: 'guile', reaver: 'ash', knight: 'iron', bard: 'song' }[CLS] ?? 'rime';
mkdirSync(OUT, { recursive: true });
let fails = 0, total = 0;
const check = (what, ok, detail = '') => { total++; if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'} ${what}${detail ? ` :: ${detail}` : ''}`); };
const overlap = (a, b) => a && b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const inside = (b, W, H) => b && b.x >= 0 && b.y >= 0 && b.x + b.w <= W && b.y + b.h <= H;

const page = await launch({ port: 9200 + Math.floor(Math.random() * 300) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const hud = () => page.eval('window.__hud ? window.__hud() : null');
const hc = (expr) => page.eval(`window.__hc.${expr}`);
const core = (body) => page.eval(`(async () => { const c = await import('/src/core/index.ts'); ${body} })()`);
const ui = () => page.eval('window.__ui.splice(0)');
const scene = (k) => page.eval(`window.__game.scene.isActive(${JSON.stringify(k)})`);
const waitFor = async (fn, ms = 15000) => { const t = Date.now(); while (Date.now() - t < ms) { const v = await fn(); if (v) return v; await sleep(300); } return null; };
const endDialogue = async () => {
  for (let i = 0; i < 30; i++) {
    const n = await page.eval(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; return d.active ? d.view.choices.length : -1; })()`);
    if (n < 0) return;
    await page.press(n > 0 ? `Digit${Math.min(9, n)}` : 'Space', 60);
    await sleep(400);
  }
};

try {
  await page.goto(`${BASE}/?scene=WorldV2&space=realm:${SCHOOL}&hc_class=${CLS}`);
  await waitFor(() => page.eval('!!(window.__hc && window.__hc.local() && window.__hud)'), 120000);
  await sleep(1500);
  await endDialogue();
  await core(`window.__ui = []; for (const n of ['ui:open', 'ui:close']) c.bus.on(n, (e) => window.__ui.push(n + ':' + e.panel));`);
  await sleep(800);

  // ── frame ──
  let h = await waitFor(async () => { const v = await hud(); return v?.alpha === 1 ? v : null; }, 5000) ?? await hud();
  const me = await hc('local()');
  check('HUD is up and visible', h?.active && h.alpha === 1, `alpha ${h?.alpha}`);
  check('name shown', !!h.text.name?.trim(), h.text.name);
  check('level matches the hero', h.text.lvl === String(me.level), `${h.text.lvl} vs ${me.level}`);
  check('HP text matches the hero', h.text.hp === `${Math.ceil(me.hp)} / ${Math.round(me.maxHp)}`, `${h.text.hp} vs ${Math.ceil(me.hp)}/${me.maxHp}`);
  check('HP bar matches the hero', Math.abs(h.bars.hp - me.hp / me.maxHp) < 0.03, `${h.bars.hp}`);
  await page.screenshot(`${OUT}/hud-start.png`);

  // ── every gear item has an icon (all 384 armour pieces were blank once: atlas `pieces` weren't indexed) ──
  const art = await page.eval(`(async () => {
    const { Art } = await import('/src/art/index.ts');
    const [a, w, it] = await Promise.all(['armour', 'weapons', 'items'].map((m) => import('/src/data/items/hc/' + m + '.gen.ts')));
    const groups = { armour: a.HC_PIECES, weapons: w.HC_WEAPONS, items: it.HC_ITEMS };
    return Object.fromEntries(Object.entries(groups).map(([k, list]) => { const miss = list.map((x) => x.id).filter((id) => !Art.tryFrame(id)); return [k, { n: list.length, missing: miss.length, first: miss.slice(0, 5) }]; }));
  })()`);
  for (const [k, r] of Object.entries(art)) check(`every ${k} entry has an icon`, r.n > 0 && r.missing === 0, `${r.n - r.missing}/${r.n}${r.missing ? ` missing ${r.first.join(', ')}` : ''}`);

  // ── layout: inside the screen, the big blocks don't overlap, the centre safe rect stays clear ──
  const { w: W, h: H } = h.size;
  const blocks = { frame: { x: 16, y: 16, w: 354, h: 100 }, minimap: h.anchors.topRight.b, tracker: h.anchors.rightColumn.b, hotbar: h.anchors.bottom.b,
    buttons: h.buttons.reduce((u, b) => (u ? { x: Math.min(u.x, b.b.x), y: Math.min(u.y, b.b.y), w: Math.max(u.x + u.w, b.b.x + b.b.w) - Math.min(u.x, b.b.x), h: Math.max(u.y + u.h, b.b.y + b.b.h) - Math.min(u.y, b.b.y) } : b.b), null) };
  check('minimap present', h.anchors.topRight.n > 0, JSON.stringify(h.anchors.topRight));
  check('hotbar present', h.anchors.bottom.n > 0, JSON.stringify(h.anchors.bottom));
  for (const [k, b] of Object.entries(blocks)) if (b) check(`${k} inside the screen`, inside(b, W, H), JSON.stringify(b));
  const names = Object.keys(blocks).filter((k) => blocks[k]);
  const clashes = names.flatMap((a, i) => names.slice(i + 1).filter((b) => overlap(blocks[a], blocks[b])).map((b) => `${a}×${b}`));
  check('HUD blocks do not overlap', clashes.length === 0, clashes.join(', '));
  const safe = { x: 320, y: 140, w: 640, h: 420 };
  const inCentre = names.filter((k) => overlap(blocks[k], safe));
  check('centre safe area kept clear', inCentre.length === 0, inCentre.join(', '));
  const offscreen = h.texts.filter((t) => t.alpha > 0 && !inside(t.b, W, H)).map((t) => t.text.slice(0, 30));
  check('no HUD text off screen', offscreen.length === 0, offscreen.join(' | '));

  // ── menu buttons: bound keys, click opens, Esc closes without pausing ──
  const expectKey = await core(`return Object.fromEntries(['inventory','skills','spells','journal','map'].map((a) => { return [a, c.keyLabel(a)]; }));`);
  check('5 menu buttons', h.buttons.length === 5, h.buttons.map((b) => b.label).join(','));
  check('buttons show the bound keys', h.buttons.every((b) => b.key === expectKey[b.panel === 'inventory' ? 'inventory' : b.panel]), h.buttons.map((b) => `${b.label}=${b.key}`).join(' '));
  for (const b of h.buttons) {
    await ui();
    await page.click(b.click.x, b.click.y); await sleep(900);
    const opened = await ui();
    const nowOpen = (await hud())?.panelOpen;
    if (b.panel === 'journal') await page.screenshot(`${OUT}/hud-journal-open.png`);
    await page.press('Escape', 60); await sleep(700);
    const closed = await ui();
    const paused = await scene('Pause');
    check(`click ${b.label} opens it, Esc closes it`, opened.includes(`ui:open:${b.panel}`) && nowOpen !== false && closed.includes(`ui:close:${b.panel}`) && !paused, `${opened} | ${closed}${paused ? ' | PAUSED' : ''}`);
    if (paused) { await page.press('Escape', 60); await sleep(500); }
  }

  // ── fade under full-screen panels ──
  await page.press('KeyJ', 60);
  const faded = await waitFor(async () => ((await hud())?.alpha ?? 1) < 0.05, 3000);
  await page.press('Escape', 60);
  const back = await waitFor(async () => (await hud())?.alpha === 1, 3000);
  check('HUD fades under the Journal and returns', !!faded && !!back);

  // ── switching tabs inside one screen, then closing it, must not leave Esc dead (user report 2026-10-21:
  //    "every so often it won't let me pause"): Pack → Skills → Spells, and Journal → Codex by key ──
  for (const [label, keys] of [['Pack → Skills → Spells', ['KeyI', 'KeyK', 'KeyB']], ['Journal → Codex', ['KeyJ', 'KeyL']]]) {
    for (const k of keys) { await page.press(k, 60); await sleep(600); }
    await page.press('Escape', 60); await sleep(700); // closes the screen
    const alpha = (await hud())?.alpha; // before Pause, which fades the HUD on purpose
    await page.press('Escape', 60);
    const ok = await waitFor(() => scene('Pause'), 3000);
    check(`after ${label} and close, Esc pauses and the HUD is visible`, !!ok && alpha === 1, `paused ${!!ok}, hud alpha ${alpha}`);
    if (ok) { await page.press('Escape', 60); await waitFor(async () => !(await scene('Pause')), 3000); }
  }

  // ── rebinding: the button label and the key both follow Settings ──
  const old = await core(`const k = c.Settings.key('inventory'); c.Settings.bind('inventory', 'U'); return k;`);
  await sleep(400);
  const packBtn = (await hud()).buttons.find((b) => b.panel === 'inventory');
  await ui(); await page.press('KeyU', 60); await sleep(800);
  const viaU = await ui();
  await page.press('Escape', 60); await sleep(500);
  check('rebinding Pack to U updates the button and opens with U', packBtn?.key === 'U' && viaU.includes('ui:open:inventory'), `button ${packBtn?.key}, events ${viaU}`);
  await core(`c.Settings.bind('inventory', ${JSON.stringify(old)});`);
  await sleep(300);
  check('restoring the binding restores the button', (await hud()).buttons.find((b) => b.panel === 'inventory')?.key === expectKey.inventory);

  // ── combat moves the bars ──
  const before = await hud();
  const ids = await hc(`spawn('bx_${SCHOOL}_0', 2, ${me.level}, 70)`);
  const mine = new Set(ids);
  const hurt = await waitFor(async () => { const p = await hc('local()'); return p.hp < p.maxHp ? p : null; }, 20000);
  await sleep(400);
  const h2 = await hud();
  check('taking damage lowers the HP bar and text', !!hurt && h2.bars.hp < before.bars.hp && h2.text.hp !== before.text.hp, `${before.text.hp} → ${h2.text.hp}`);
  const emBefore = h2.text.em;
  let emMoved = false, casts = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < 60000) {
    const foes = (await hc('enemies()')).filter((e) => mine.has(e.id));
    const hero = await hc('local()');
    if (!foes.length || hero.dead) break;
    const at = await hc(`screenOf(${JSON.stringify(foes[0].id)})`);
    if (at && hero.target !== foes[0].id) await page.click(Math.round(at.x), Math.round(at.y));
    await page.press(['Digit1', 'Digit2', 'Digit3'][casts++ % 3], 60);
    if (hero.hp < hero.maxHp * 0.4) await page.press('KeyQ', 60);
    await sleep(300);
    if (!emMoved && (await hud()).text.em !== emBefore) emMoved = true;
  }
  await page.screenshot(`${OUT}/hud-fight.png`);
  const h3 = await hud();
  const left = (await hc('enemies()')).filter((e) => mine.has(e.id)).length;
  check('casting moves the Ember bar', emMoved, `${emBefore} → ${h3.text.em}`);
  check('kills raise the XP bar (or the level)', left === 0 && (h3.bars.xp > before.bars.xp || Number(h3.text.lvl) > Number(before.text.lvl)), `xp ${before.bars.xp} → ${h3.bars.xp}, lvl ${before.text.lvl} → ${h3.text.lvl}, left ${left}`);
  check('loot feed shows the rewards', h3.texts.some((t) => t.text.startsWith('+ ') && t.b.x < 400) || left > 0, h3.texts.filter((t) => t.text.startsWith('+')).map((t) => t.text).join(' | '));

  // ── boss bar ──
  const textsBefore = new Set((await hud()).texts.map((t) => t.text));
  const boss = await hc(`spawn('bx_${SCHOOL}_5', 1, ${me.level}, 160)`);
  const at = await hc(`screenOf(${JSON.stringify(boss[0])})`);
  if (at) await page.click(Math.round(at.x), Math.round(at.y));
  await page.press('Digit1', 60);
  const bossText = await waitFor(async () => (await hud()).texts.find((t) => !textsBefore.has(t.text) && t.b.y < 160 && t.b.x > 380 && t.b.x < 980), 8000);
  await page.screenshot(`${OUT}/hud-boss.png`);
  check('boss bar appears in the top band', !!bossText, bossText?.text ?? '');
  await page.eval(`window.__hc.enemies().filter((e) => e.id === ${JSON.stringify(boss[0])}).length`); // keep the page busy until the bar drew

  // ── toast + banner ──
  await core(`c.bus.emit('narrative:toast', { text: 'HUD test toast', kind: 'quest' });`);
  await sleep(500);
  const toast = (await hud()).texts.find((t) => t.text === 'HUD test toast');
  check('toast shows at the right edge, on screen', !!toast && toast.b.x + toast.b.w > W * 0.6 && inside(toast.b, W, H) && !overlap(toast.b, blocks.minimap), JSON.stringify(toast?.b));
  await core(`c.bus.emit('region:entered', { regionId: 'hud-test', prevRegionId: null, name: 'Testing Vale', subtitle: 'a HUD banner' });`);
  const banner = await waitFor(async () => (await hud()).texts.find((t) => t.text === 'TESTING VALE'), 6000);
  check('region banner shows at top centre', !!banner && Math.abs(banner.b.x + banner.b.w / 2 - W / 2) < 8, JSON.stringify(banner?.b));
  await page.screenshot(`${OUT}/hud-toast-banner.png`);

  // ── Esc pauses when nothing is open; Death screen on death ──
  await page.press('Escape', 60);
  const paused = await waitFor(() => scene('Pause'), 3000);
  const fadedUnderPause = await waitFor(async () => ((await hud())?.alpha ?? 1) < 0.05, 3000); // its menu would sit on the hotbar
  await page.press('Escape', 60);
  const unpaused = await waitFor(async () => !(await scene('Pause')), 3000);
  const backAfterPause = await waitFor(async () => (await hud())?.alpha === 1, 3000);
  check('Esc opens Pause and closes it again', !!paused && !!unpaused);
  check('HUD fades under Pause and returns', !!fadedUnderPause && !!backAfterPause);
  await core(`c.bus.emit('player:died', { playerId: c.Services.get('net').localPlayer, x: 0, y: 0, regionId: 'hud-test', killerName: 'HUD test' });`);
  const dead = await waitFor(() => scene('Death'), 4000);
  await page.screenshot(`${OUT}/hud-death.png`);
  check('death opens the Death screen', !!dead);

  check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (e) {
  check('harness', false, e.message);
}
await page.close();
console.log(`\n${total - fails}/${total} passed`);
process.exit(fails ? 1 : 0);
