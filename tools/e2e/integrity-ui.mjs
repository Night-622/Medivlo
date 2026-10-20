#!/usr/bin/env node
/**
 * Integrity checks for front-end lifecycle bugs, in headless Chrome (one at a time via cdp.mjs). Owner: Claude 6.
 *
 *   npx vite --config tools/e2e/vite.test.config.mjs ; node tools/e2e/integrity-ui.mjs [--base http://localhost:5199]
 *
 * Each check is a bug that once shipped: re-baking a sheet a sprite was showing froze the game (null glTexture /
 * sourceSize every frame); a Pause rebind put Esc on People (one Esc opened two screens); the title's keyboard went
 * dead after a co-op join; HUD toasts crept off-screen and banners stopped after quitting mid-toast; People always
 * listed Brindlecross, even in the school realms.
 */
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5199');
let fails = 0;
const check = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${String(detail).slice(0, 240)})` : ''}`); if (!ok) fails++; };

const page = await launch();
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args?.map((a) => a.value ?? a.description).join(' ').slice(0, 200));
});
const ev = (expr) => page.eval(`(async () => (${expr}))()`);
const waitFor = async (expr, ms = 90_000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await ev(expr)) return true; } catch { /* loading */ } await sleep(400); } return false; };
const errorsSince = (n) => errors.slice(n).filter((e) => !/auth\/|firestore|Firebase|realm server/i.test(e ?? ''));

try {
  await page.goto(`${BASE}/`);
  check('title up', await waitFor(`!!window.__game?.scene.isActive('MainMenu')`));

  // 1. re-baking a sheet that sprites are showing (bakeHero-style: anims rebuilt with it, and a plain re-add)
  const e0 = errors.length;
  const bake = await ev(`(async () => {
    const art = await import('/src/art/index.ts');
    const s = window.__game.scene.getScene('MainMenu');
    const sheet = (n, c) => Array.from({ length: n }, (_, i) => { const k = document.createElement('canvas'); k.width = 16; k.height = 16 + i; const g = k.getContext('2d'); g.fillStyle = c; g.fillRect(0, 0, 8, 8); return k; });
    const anim = () => { if (s.anims.exists('itest:idle')) s.anims.remove('itest:idle'); s.anims.create({ key: 'itest:idle', frames: s.anims.generateFrameNumbers('itest', { frames: [0, 1] }), frameRate: 12, repeat: -1 }); };
    art.addCanvasSheet(s, 'itest', sheet(2, '#f00')); anim();
    const a = s.add.sprite(200, 200, 'itest', 0).play('itest:idle'), b = s.add.container(0, 0, [s.add.sprite(240, 200, 'itest', 1).play('itest:idle')]);
    await new Promise((r) => setTimeout(r, 300));
    art.replaceSheet(s, 'itest', () => { art.addCanvasSheet(s, 'itest', sheet(3, '#0f0')); anim(); }); // like bakeHero
    await new Promise((r) => setTimeout(r, 400));
    const onNew = a.texture === s.textures.get('itest') && a.anims.isPlaying && b.list[0].texture === s.textures.get('itest');
    art.addCanvasSheet(s, 'itest', sheet(2, '#00f')); // plain re-add, anims rebuilt later by the caller
    await new Promise((r) => setTimeout(r, 400));
    anim(); a.play('itest:idle'); b.list[0].play('itest:idle');
    await new Promise((r) => setTimeout(r, 300));
    const ok = a.texture === s.textures.get('itest');
    a.destroy(); b.destroy();
    return { onNew, ok };
  })()`);
  const bakeErrs = errorsSince(e0);
  check('re-baking a sheet on screen keeps sprites drawing (no null glTexture/sourceSize)', bake.onNew && bake.ok && !bakeErrs.length, JSON.stringify(bake) + ' ' + bakeErrs.slice(0, 2).join(' | '));

  // 2. Esc stays the universal back key through a swap
  const keys = await ev(`(async () => {
    const { Settings, keyLabel } = await import('/src/core/index.ts');
    Settings.reset();
    const people = Settings.key('people');
    Settings.bind('pause', people); // Pause → the People key: the swap used to hand Esc to People
    const out = { people: Settings.key('people'), pause: Settings.key('pause'), label: keyLabel('people') };
    Settings.reset();
    return out;
  })()`);
  check('a rebind never moves Esc onto another action', keys.people !== 'ESC' && keys.pause !== 'ESC' && !!keys.label, JSON.stringify(keys));

  // 3. title keyboard after a join (the flag only CodeEntry's cancel used to clear)
  const titleKeys = await ev(`(async () => {
    const s = window.__game.scene.getScene('MainMenu');
    s.joinOpen = true; s.scene.restart();
    await new Promise((r) => setTimeout(r, 600));
    return window.__game.scene.getScene('MainMenu').joinOpen;
  })()`);
  check('the title keyboard works again after leaving a joined game', titleKeys === false);

  // 3b. character creation: Esc used to drop a whole customisation without asking
  const inCC = `window.__game.scene.isActive('CharacterCreate')`;
  const confirmUp = `!!window.__game.scene.getScene('CharacterCreate').confirm`;
  await ev(`(window.__game.scene.getScene('MainMenu').scene.start('CharacterCreate', { slot: 2 }), 1)`);
  await waitFor(inCC, 15000); await sleep(600);
  await page.press('Escape'); await sleep(500);
  const untouched = await ev(`window.__game.scene.isActive('MainMenu')`);
  await ev(`(window.__game.scene.getScene('MainMenu').scene.start('CharacterCreate', { slot: 2 }), 1)`);
  await waitFor(inCC, 15000); await sleep(600);
  await page.press('KeyQ'); await sleep(200); // a letter goes into the name
  await page.press('Escape'); await sleep(400);
  const asked = await ev(`${inCC} && ${confirmUp}`);
  await page.press('Enter'); await sleep(400);
  const kept = await ev(`${inCC} && !${confirmUp}`);
  await page.press('Escape'); await sleep(300); await page.press('Escape'); await sleep(600);
  const discarded = await ev(`window.__game.scene.isActive('MainMenu')`);
  check('character creation asks before discarding an edited hero', untouched && asked && kept && discarded, JSON.stringify({ untouched, asked, kept, discarded }));

  // 4. a Warden in the Rime realm: People lists the realm's people; HUD state resets across a restart
  await ev(`(async () => {
    const core = await import('/src/core/index.ts');
    const { defaultLook } = await import('/src/data/classes/hc/index.ts');
    const st = core.createNewGameState(0);
    st.player.name = 'Tess';
    st.player.hero = { classId: 'warden', look: defaultLook('warden', 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
    st.world.location.space = 'realm:rime';
    core.Game.set(st);
    window.__game.scene.getScene('MainMenu').scene.start('WorldV2');
    return 1;
  })()`);
  check('in the Rime realm', await waitFor(`!!window.__game.scene.isActive('HudV2')`));
  await sleep(2500);
  const people = await ev(`(async () => {
    const core = await import('/src/core/index.ts');
    const { markerAt } = await import('/src/world/hc/spawns.ts');
    core.bus.emit('ui:open', { panel: 'people' });
    await new Promise((r) => setTimeout(r, 1200));
    const p = window.__game.scene.getScene('People');
    const head = p.children.list.find((o) => typeof o.text === 'string' && o.text.startsWith('People of'))?.text;
    const ids = (p.people ?? []).map((n) => n.id);
    const wrong = (p.people ?? []).filter((n) => markerAt(n.home)?.space !== 'realm:rime').map((n) => n.id);
    p.scene.stop(); core.bus.emit('ui:close', { panel: 'people' });
    return { head, n: ids.length, wrong };
  })()`);
  check("People in a school realm lists that realm's people", people.n > 0 && !people.wrong.length && people.head && !people.head.includes('Brindlecross'), JSON.stringify(people));

  const hud = await ev(`(async () => {
    const h = window.__game.scene.getScene('HudV2');
    h.toast('one'); h.toast('two'); h.toast('three'); h.banner('Test banner');
    const before = { y: h.toastY, busy: h.bannerBusy };
    h.scene.restart();
    await new Promise((r) => setTimeout(r, 800));
    const h2 = window.__game.scene.getScene('HudV2');
    return { before, after: { y: h2.toastY, busy: h2.bannerBusy, panel: h2.panelOpen } };
  })()`);
  check('HUD toasts and banners start fresh after the HUD restarts', hud.before.y > 300 && hud.after.y === 300 && hud.after.busy === false && hud.after.panel === false, JSON.stringify(hud));

  const e1 = errors.length;
  await sleep(1500);
  check('no page errors', !errorsSince(0).length && !errorsSince(e1).length, errorsSince(0).slice(0, 3).join(' || '));
} catch (e) { check('harness', false, String(e)); }

await page.close();
console.log(fails ? `\nintegrity-ui: ${fails} FAILED` : '\nintegrity-ui: ALL PASS');
process.exit(fails ? 1 : 0);
