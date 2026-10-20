// QA (Claude 7): small world things a player feels.
//  1. the hero is never lost behind a tree: standing just behind a tall prop fades it (Claude 2's Occlusion), and
//     walking out with real WASD brings it back
//  2. a search object that has counted shows "Already read / Already searched" on its [F] prompt after a real F
// Hero set up as character creation would (not the ?hc_class dev path). Screenshots in --out.
//   node tools/e2e/qa-world-feel.mjs [--base http://localhost:5170] [--out tools/e2e/out/qa]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5170'), OUT = arg('out', 'tools/e2e/out/qa'), CLS = 'rimecaller';
mkdirSync(OUT, { recursive: true });
let fails = 0, total = 0;
const check = (what, ok, detail = '') => { total++; if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'} ${what}${detail ? ` :: ${String(detail).slice(0, 260)}` : ''}`); return ok; };
const page = await launch({ port: 9150 + Math.floor(Math.random() * 50) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const ev = (e) => page.eval(e);
const waitFor = async (expr, ms = 90000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (await ev(expr)) return true; } catch { /* loading */ } await sleep(300); } return false; };
const endDialogue = async () => { for (let i = 0; i < 30; i++) { const n = await ev(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; return d.active ? d.view.choices.length : -1; })()`); if (n < 0) return; await page.press(n ? 'Digit1' : 'Space'); await sleep(300); } };

try {
  await page.goto(`${BASE}/`);
  await waitFor(`!!window.__game?.scene.isActive('MainMenu')`);
  await ev(`(async () => { const core = await import('/src/core/index.ts'); const { defaultLook } = await import('/src/data/classes/hc/index.ts');
    const st = core.createNewGameState(0); st.player.name = 'Tam';
    st.player.hero = { classId: '${CLS}', look: defaultLook('${CLS}', 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
    core.Game.set(st); window.__game.scene.getScene('MainMenu').scene.start('WorldV2'); return 1; })()`);
  await waitFor('!!(window.__hc && window.__hc.local() && window.__world)');
  await sleep(2500); await endDialogue();
  await ev(`(async () => { const c = await import('/src/core/index.ts'); for (const e of window.__hc.enemies()) c.Services.get('combat').despawn(e.id); return 1; })()`);

  // ── 1. behind a tree ── go to the forest by the first lair, pick a tall prop, stand just behind it
  const door = await ev(`(async () => { const { markerAt } = await import('/src/world/hc/spawns.ts'); return markerAt('obj:rime-capital-lair-1-door'); })()`);
  await ev(`window.__world.tp(${door.at[0] + 4}, ${door.at[1] + 6})`); await sleep(1500);
  const tree = await ev(`(() => { const w = window.__game.scene.getScene('WorldV2'), p = window.__hc.local(); let best = null;
    for (const s of w.chunks.spritesNear(p.x, p.y)) { if (s.displayHeight < 48 || !s.visible) continue; const d = Math.hypot(s.x - p.x, s.y - p.y);
      const tx = Math.floor(s.x / 32), ty = Math.floor((s.y - 18) / 32); if (!w.query.isWalkable(tx, ty)) continue;
      const tree = /pine|tree|oak|fir|spruce|willow|birch|cedar|yew/i.test(s.texture.key + ':' + s.frame.name) ? 0 : 1; if (!best || tree < best.tree || (tree === best.tree && d < best.d)) best = { tree, d, x: s.x, y: s.y, h: s.displayHeight, key: s.texture.key + ':' + s.frame.name, tx, ty }; } return best; })()`);
  if (check('a tall prop with walkable ground just behind it', !!tree, JSON.stringify(tree))) {
    await ev(`(() => { const w = window.__game.scene.getScene('WorldV2'); w.player.teleport(${tree.x}, ${tree.y - 14}); return 1; })()`);
    await sleep(1200);
    const faded = await ev(`(() => { const w = window.__game.scene.getScene('WorldV2'); const out = []; for (const [s] of w.seeThrough.faded) out.push({ key: s.texture.key + ':' + s.frame.name, a: +s.alpha.toFixed(2), x: Math.round(s.x), y: Math.round(s.y) }); return out; })()`);
    const mine = faded.find((f) => Math.abs(f.x - Math.round(tree.x)) <= 1 && Math.abs(f.y - Math.round(tree.y)) <= 1);
    check('standing behind a tall prop fades it so the hero shows through', !!mine && mine.a < 0.6, JSON.stringify({ tree: tree.key, mine, faded: faded.length }));
    await page.screenshot(`${OUT}/feel-behind-tree.png`);
    await page.hold(['KeyS'], 900); await page.hold(['KeyD'], 700); await sleep(1500);
    const back = await ev(`(() => { const w = window.__game.scene.getScene('WorldV2'); for (const s of w.chunks.spritesNear(${tree.x}, ${tree.y})) if (Math.abs(s.x - ${tree.x}) < 1 && Math.abs(s.y - ${tree.y}) < 1) return +s.alpha.toFixed(2); return null; })()`);
    check('walking out (real S/D) brings the prop back to full alpha', back !== null && back > 0.95, `alpha ${back}`);
  }

  // ── 2. a used search object says so ──
  await ev(`(async () => { const q = await import('/src/narrative/engine/quests.ts'); const c = await import('/src/core/index.ts'); q.startQuest('quest:rimecaller-the-hold-gauges'); c.Game.state.narrative.trackedQuest = 'quest:rimecaller-the-hold-gauges'; return 1; })()`);
  const g1 = await ev(`(async () => (await import('/src/world/hc/spawns.ts')).markerAt('obj:hold-gauge-1'))()`);
  let at = false;
  for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1]]) { await ev(`window.__world.tp(${g1.at[0] + dx}, ${g1.at[1] + dy})`); await sleep(700); if ((await ev('window.__world.focus()')) === 'obj:hold-gauge-1') { at = true; break; } }
  if (check('the hero can stand at hold-gauge 1 with it in focus', at)) {
    const before = await ev(`window.__game.scene.getScene('WorldV2').focus.text.text`);
    await page.press('KeyF'); await sleep(900); await endDialogue(); await sleep(800);
    const after = await ev(`window.__game.scene.getScene('WorldV2').focus.text.text`);
    check('after reading it, the gauge\'s [F] prompt says it is done', /Already (read|searched|seen)/.test(after) && !/Already/.test(before), JSON.stringify({ before, after }));
    await page.screenshot(`${OUT}/feel-already-read.png`);
  }
} catch (e) { check('harness', false, String(e?.stack ?? e).split('\n').slice(0, 2).join(' < ')); }
const errs = errors.filter((e) => !/auth\/|firestore|Firebase/i.test(e));
check('no console errors', !errs.length, errs.slice(0, 4).join(' | '));
await page.close();
console.log(`\n${total - fails}/${total} passed`);
process.exit(fails ? 1 : 0);
