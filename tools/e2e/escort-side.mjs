// Escorts walk side-on (Claude 5, NPCs in profile; pre-deploy suite). In the real browser with real WASD: every atlas NPC has its
// npcs:<id>:idle-side / walk-side anims (npcBake); an escort following the hero plays walk-side facing right
// unflipped when it walks east and flipped when it walks west; on a diagonal it keeps one steady view (sticky facing).
//   npx vite --config tools/e2e/vite.test.config.mjs --port 5296 --strictPort ; node tools/e2e/escort-side.mjs [--base http://localhost:5296]
// Failing lines start with "FAIL"; the last line is "N/M passed"; exit code 1 on any failure.
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5296'), OUT = 'tools/e2e/out/side';
const NPC = arg('npc', 'npc:forgewife-ada');
mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ` :: ${String(detail).slice(0, 240)}` : ''}`); if (ok) pass++; else fail++; return ok; };
const page = await launch({ port: 9700 + Math.floor(Math.random() * 200) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const ev = (expr) => page.eval(expr);
const waitFor = async (expr, ms = 60000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (await ev(expr)) return true; } catch { /* loading */ } await sleep(300); } return false; };
const endDialogue = async () => {
  for (let i = 0; i < 40; i++) {
    const n = await ev(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; return d.active ? d.view.choices.length : -1; })()`);
    if (n < 0) return;
    await page.press(n > 0 ? 'Digit1' : 'Space', 60); await sleep(300);
  }
};
// the escort: its sim entity (authority) and the sprite CombatView draws for it (nearest npcs:* sprite to it)
const probe = () => ev(`(() => {
  const e = window.__hc.enemies().find((x) => x.def === 'bx_escort');
  if (!e) return null;
  const sc = window.__game.scene.getScene('WorldV2');
  let best = null, bd = 1e9;
  for (const o of sc.children.list) {
    if (o.type !== 'Sprite' || !String(o.texture?.key).startsWith('npcs:') || !o.anims) continue;
    const d = Math.hypot(o.x - e.x, o.y - e.y);
    if (d < bd) { bd = d; best = o; }
  }
  return best && bd < 48 ? { x: e.x, y: e.y, key: best.texture.key, anim: best.anims.currentAnim?.key ?? '', flipX: best.flipX } : { x: e.x, y: e.y, key: '', anim: '', flipX: false };
})()`);
// hold keys and sample the escort every 100 ms; returns the moving samples with their step (dx, dy)
async function walk(codes, ms) {
  for (const c of codes) await page.keyDown(c);
  const out = []; let prev = await probe();
  for (let t = 0; t < ms; t += 100) {
    await sleep(100);
    const s = await probe();
    if (s && prev) out.push({ ...s, dx: s.x - prev.x, dy: s.y - prev.y, t });
    prev = s;
  }
  for (const c of codes) await page.keyUp(c);
  await sleep(600);
  return out;
}

try {
  await page.goto(`${BASE}/`);
  if (!(await waitFor(`!!window.__game?.scene.isActive('MainMenu')`, 90000))) throw new Error('title never appeared');
  // every atlas NPC is baked side-on (npcBake, called at boot after mvReady)
  const baked = await ev(`(() => { const sc = window.__game.scene.getScene('MainMenu'), ids = Object.keys(window.MV.HERO).filter((k) => window.MV.HERO[k].npc && sc.textures.exists('npcs:' + k));
    return { ids, missing: ids.filter((k) => !(sc.anims.exists('npcs:' + k + ':walk-side') && sc.anims.exists('npcs:' + k + ':idle-side') && sc.textures.get('npcs:' + k).frameTotal - 1 >= 12)) }; })()`);
  check(baked.ids.length >= 14 && baked.missing.length === 0, `npcBake: all ${baked.ids.length} atlas NPCs have idle-side + walk-side`, baked.missing.join(','));

  await ev(`(async () => {
    const core = await import('/src/core/index.ts');
    const { defaultLook } = await import('/src/data/classes/hc/index.ts');
    const st = core.createNewGameState(0);
    st.player.name = 'Tess';
    st.player.hero = { classId: 'warden', look: defaultLook('warden', 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
    core.Game.set(st);
    window.__game.scene.getScene('MainMenu').scene.start('WorldV2');
    return 1;
  })()`);
  if (!(await waitFor('!!(window.__hc && window.__hc.local())', 90000))) throw new Error('hero never appeared');
  await sleep(2500);
  await endDialogue();
  await ev(`(async () => { const c = await import('/src/core/index.ts'); for (const e of window.__hc.enemies()) c.Services.get('combat').despawn(e.id); return 1; })()`);
  // an escort a step behind the hero (west), following the party, drawn with its NPC's stand-in sheet
  await ev(`(async () => { const c = await import('/src/core/index.ts'); const p = window.__hc.local();
    return c.Services.get('combat').spawn({ creature: 'bx_escort', level: p.level, space: p.space, x: p.x - 70, y: p.y, follow: 'party', escort: { npc: ${JSON.stringify(NPC)} } }); })()`);
  await sleep(1200);
  const first = await probe();
  check(!!first?.key, 'escort drawn with an NPC sheet', JSON.stringify(first));

  const east = (await walk(['KeyD'], 2200)).filter((s) => s.dx > 1 && Math.abs(s.dx) > 1.5 * Math.abs(s.dy));
  check(east.length >= 3, 'escort walked east (following the hero)', east.length);
  // side-on and facing right throughout (idle-side while it slows to a stop beside the hero), walk-side while it strides
  const eastBad = east.slice(2).filter((s) => !s.anim.endsWith('-side') || s.flipX);
  check(east.length >= 3 && eastBad.length === 0 && east.some((s) => s.anim.endsWith(':walk-side')), 'walking east: walk-side, not flipped (faces right)', JSON.stringify(eastBad[0] ?? east[2]));
  await page.screenshot(`${OUT}/escort-east.png`);

  const west = (await walk(['KeyA'], 3200)).filter((s) => s.dx < -1 && Math.abs(s.dx) > 1.5 * Math.abs(s.dy));
  check(west.length >= 3, 'escort walked west', west.length);
  const westBad = west.slice(2).filter((s) => !s.anim.endsWith('-side') || !s.flipX);
  check(west.length >= 3 && westBad.length === 0 && west.some((s) => s.anim.endsWith(':walk-side')), 'walking west: walk-side, flipped (faces left)', JSON.stringify(westBad[0] ?? west[2]));
  await page.screenshot(`${OUT}/escort-west.png`);

  // a diagonal (west + south, so the escort, east of the hero now, follows on the same heading): once it has turned
  // onto it, one steady view while it walks, no front <-> side flicker
  const diag = (await walk(['KeyA', 'KeyS'], 3000)).filter((s) => s.t >= 1000 && Math.hypot(s.dx, s.dy) > 1);
  const views = new Set(diag.map((s) => (s.anim.endsWith('-side') ? 'side' : 'front') + (s.flipX ? '-flip' : '')));
  check(diag.length >= 3 && views.size === 1, 'diagonal walk: one steady view', [...views].join(',') + ' over ' + diag.length);

  check(errors.length === 0, 'no page errors', errors.slice(0, 3).join(' | '));
} catch (e) { check(false, 'run', e.message); }
console.log(`${pass}/${pass + fail} passed`);
await page.close();
process.exit(fail ? 1 : 0);
