// Screenshots of every in-game overlay (Claude 1): a Warden in WorldV2 (Brindlecross), then dialogue, journal,
// codex, people, pause. Needs the no-HMR test server (port 5199). Takes the chrome-lock via cdp.mjs.
//   node tools/e2e/ui-shots.mjs [--base http://localhost:5199] [--out tools/e2e/out] [--only dialogue,journal]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5199');
const OUT = arg('out', 'tools/e2e/out');
const ONLY = arg('only', '').split(',').filter(Boolean);
const QUERY = arg('query', ''); // e.g. hidpi=1
mkdirSync(OUT, { recursive: true });

const page = await launch({ port: 9500 + Math.floor(Math.random() * 300) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n').slice(4, 14).join(' | ') ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const waitFor = async (expr, ms = 90000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.eval(expr)) return true; await sleep(400); } return false; };
const want = (k) => !ONLY.length || ONLY.includes(k);
/** Leave any conversation: pick the last choice (usually Farewell) or advance, until it ends. */
const endDialogue = async () => {
  for (let i = 0; i < 30; i++) {
    const n = await page.eval(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; return d.active ? d.view.choices.length : -1; })()`);
    if (n < 0) return;
    await page.press(n > 0 ? `Digit${Math.min(9, n)}` : 'Space', 60);
    await sleep(400);
  }
};

try {
  await page.goto(`${BASE}/${QUERY ? `?${QUERY}` : ''}`);
  await waitFor(`!!window.__game?.scene.isActive('MainMenu')`);
  await page.eval(`(async () => {
    const core = await import('/src/core/index.ts');
    const { defaultLook } = await import('/src/data/classes/hc/index.ts');
    const st = core.createNewGameState(0);
    st.player.name = 'Ana';
    st.player.hero = { classId: 'warden', look: defaultLook('warden', 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
    st.world.location.space = 'concordia';
    core.Game.set(st);
    window.__game.scene.getScene('MainMenu').scene.start('WorldV2');
  })()`);
  await waitFor(`!!window.__game.scene.isActive('HudV2')`);
  await sleep(5000);
  await page.screenshot(`${OUT}/ui-dialogue-intro.png`); // the class opening narration (ui-hud below is the world without it)
  await endDialogue(); // class openings start with narration
  await sleep(800);
  await page.screenshot(`${OUT}/ui-hud.png`);
  if (want('dialogue')) {
    await page.eval(`window.narrative?.talk('npc:maren')`);
    await sleep(1500);
    await page.screenshot(`${OUT}/ui-dialogue.png`);
    await page.press('Digit1', 60); await sleep(1200);
    await page.screenshot(`${OUT}/ui-dialogue-2.png`);
    await endDialogue();
  }
  for (const [k, key] of [['journal', 'KeyJ'], ['codex', 'KeyL'], ['people', 'KeyP'], ['pack', 'KeyI'], ['skills', 'KeyK'], ['spells', 'KeyB'], ['map', 'KeyM']]) {
    if (!want(k)) continue;
    await page.press(key, 60); await sleep(1500);
    console.log(k, 'open:', await page.eval(`JSON.stringify(window.__game.scene.getScenes(true).map((x) => x.scene.key))`));
    await page.screenshot(`${OUT}/ui-${k}.png`);
    await page.press('Escape', 60); await sleep(600);
  }
  if (want('pause')) { await page.press('Escape', 60); await sleep(1200); await page.screenshot(`${OUT}/ui-pause.png`); await page.press('Escape', 60); }
} catch (e) { console.log('ERROR', String(e)); }
console.log(errors.length ? `page errors:\n  ${errors.slice(0, 8).join('\n  ')}` : 'no page errors');
await page.close();
process.exit(0);
